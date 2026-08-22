"""
Test configuration — SQLite in-memory via aiosqlite.

All tests share a single session-scoped AsyncSession so that data committed
in one test is immediately visible to the next (SQLite snapshot isolation
would hide committed rows from a newly opened session on the same connection).
Unique emails/IDs per test prevent cross-test interference.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.database import Base
from app.dependencies import get_db

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


def _strip_server_defaults(metadata):
    """Remove Postgres-only server_defaults so SQLite can build the schema."""
    for table in metadata.tables.values():
        for col in table.columns:
            col.server_default = None


@pytest_asyncio.fixture(scope="session")
async def engine():
    eng = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    import app.models  # noqa: F401
    _strip_server_defaults(Base.metadata)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    await eng.dispose()


@pytest_asyncio.fixture(scope="session")
async def db_session(engine):
    """Single shared session for the whole test session — avoids snapshot isolation issues."""
    async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    # Reset rate-limiter storage before each test so login attempts don't
    # accumulate across the test session and trigger the 10/min cap.
    from app.core.rate_limit import limiter
    limiter._storage.reset()  # type: ignore[attr-defined]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def get_token(client: AsyncClient, email: str, password: str = "Password1") -> str:
    await client.post("/api/v1/auth/signup",
                      json={"email": email, "password": password, "name": "Tester"})
    resp = await client.post("/api/v1/auth/login",
                             json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]


async def auth_headers(client: AsyncClient, email: str = "test@example.com",
                       password: str = "Password1") -> dict:
    return {"Authorization": f"Bearer {await get_token(client, email, password)}"}


async def create_user(client: AsyncClient, email="test@example.com",
                      password="Password1", name="Tester"):
    return await client.post("/api/v1/auth/signup",
                             json={"email": email, "password": password, "name": name})
