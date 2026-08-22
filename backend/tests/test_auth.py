import pytest
from httpx import AsyncClient
from tests.conftest import create_user, auth_headers


pytestmark = pytest.mark.asyncio


async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


async def test_signup_success(client: AsyncClient):
    resp = await create_user(client, email="signup@example.com")
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "signup@example.com"
    assert "hashed_password" not in data
    assert "id" in data


async def test_signup_duplicate_email(client: AsyncClient):
    await create_user(client, email="dup@example.com")
    resp = await create_user(client, email="dup@example.com")
    assert resp.status_code == 409


async def test_signup_weak_password(client: AsyncClient):
    resp = await client.post("/api/v1/auth/signup", json={
        "email": "weak@example.com", "password": "short", "name": "Weak"
    })
    assert resp.status_code == 422


async def test_signup_invalid_email(client: AsyncClient):
    resp = await client.post("/api/v1/auth/signup", json={
        "email": "not-an-email", "password": "Password1", "name": "Bad"
    })
    assert resp.status_code == 422


async def test_login_success(client: AsyncClient):
    await create_user(client, email="login@example.com")
    resp = await client.post("/api/v1/auth/login", json={
        "email": "login@example.com", "password": "Password1"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


async def test_login_wrong_password(client: AsyncClient):
    await create_user(client, email="wrongpw@example.com")
    resp = await client.post("/api/v1/auth/login", json={
        "email": "wrongpw@example.com", "password": "WrongPass1"
    })
    assert resp.status_code == 401


async def test_login_nonexistent_user(client: AsyncClient):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "ghost@example.com", "password": "Password1"
    })
    assert resp.status_code == 401


async def test_get_me_authenticated(client: AsyncClient):
    await create_user(client, email="me@example.com")
    headers = await auth_headers(client, email="me@example.com")
    resp = await client.get("/api/v1/users/me", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "me@example.com"
    assert "hashed_password" not in data


async def test_get_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 403  # HTTPBearer returns 403 when no credentials provided


async def test_refresh_token(client: AsyncClient):
    await create_user(client, email="refresh@example.com")
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "refresh@example.com", "password": "Password1"
    })
    refresh_token = login_resp.json()["refresh_token"]
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


async def test_forgot_password_always_200(client: AsyncClient):
    # Should return 200 even for non-existent email (no enumeration)
    resp = await client.post("/api/v1/auth/forgot-password", json={"email": "nobody@example.com"})
    assert resp.status_code == 200
    assert "reset link" in resp.json()["message"].lower()


async def test_reset_password_flow(client: AsyncClient):
    await create_user(client, email="resetme@example.com")
    forgot_resp = await client.post("/api/v1/auth/forgot-password", json={"email": "resetme@example.com"})
    raw_token = forgot_resp.json().get("reset_token")
    assert raw_token, "Dev mode should expose reset_token"

    reset_resp = await client.post("/api/v1/auth/reset-password", json={
        "token": raw_token, "new_password": "NewPassword1"
    })
    assert reset_resp.status_code == 200

    # Old password should now fail
    old_login = await client.post("/api/v1/auth/login", json={
        "email": "resetme@example.com", "password": "Password1"
    })
    assert old_login.status_code == 401

    # New password should work
    new_login = await client.post("/api/v1/auth/login", json={
        "email": "resetme@example.com", "password": "NewPassword1"
    })
    assert new_login.status_code == 200


async def test_reset_token_single_use(client: AsyncClient):
    await create_user(client, email="singleuse@example.com")
    forgot_resp = await client.post("/api/v1/auth/forgot-password", json={"email": "singleuse@example.com"})
    raw_token = forgot_resp.json()["reset_token"]

    await client.post("/api/v1/auth/reset-password", json={
        "token": raw_token, "new_password": "NewPassword1"
    })
    # Reuse should fail
    resp = await client.post("/api/v1/auth/reset-password", json={
        "token": raw_token, "new_password": "AnotherPass1"
    })
    assert resp.status_code == 400


async def test_patch_me(client: AsyncClient):
    await create_user(client, email="patchme@example.com")
    headers = await auth_headers(client, email="patchme@example.com")
    resp = await client.patch("/api/v1/users/me", headers=headers, json={"name": "Updated Name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"


async def test_delete_me(client: AsyncClient):
    await create_user(client, email="deleteme@example.com")
    headers = await auth_headers(client, email="deleteme@example.com")
    resp = await client.delete("/api/v1/users/me", headers=headers)
    assert resp.status_code == 200
    # Token should now be invalid
    me_resp = await client.get("/api/v1/users/me", headers=headers)
    assert me_resp.status_code == 401
