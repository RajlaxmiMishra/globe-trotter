from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.city import City


async def list_cities(
    db: AsyncSession,
    q: str | None,
    country: str | None,
    region: str | None,
    sort: str,
    limit: int,
    offset: int,
) -> dict:
    stmt = select(City)

    if q:
        stmt = stmt.where(City.name.ilike(f"%{q}%"))
    if country:
        stmt = stmt.where(City.country.ilike(f"%{country}%"))
    if region:
        stmt = stmt.where(City.region.ilike(f"%{region}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())

    if sort == "popularity":
        stmt = stmt.order_by(City.popularity_score.desc().nulls_last())
    elif sort == "cost_asc":
        stmt = stmt.order_by(City.cost_index.asc().nulls_last())
    elif sort == "cost_desc":
        stmt = stmt.order_by(City.cost_index.desc().nulls_last())
    else:
        stmt = stmt.order_by(City.popularity_score.desc().nulls_last())

    stmt = stmt.offset(offset).limit(limit)

    result = await db.execute(stmt)
    cities = result.scalars().all()

    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()

    return {"items": cities, "total": total}
