from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity import Activity


async def list_activities(
    db: AsyncSession,
    city_id,
    category: str | None,
    max_cost: Decimal | None,
    max_duration: int | None,
    limit: int,
    offset: int,
) -> dict:
    stmt = select(Activity)

    if city_id:
        stmt = stmt.where(Activity.city_id == city_id)
    if category:
        stmt = stmt.where(Activity.category == category)
    if max_cost is not None:
        stmt = stmt.where(Activity.cost <= max_cost)
    if max_duration is not None:
        stmt = stmt.where(Activity.duration_minutes <= max_duration)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    stmt = stmt.order_by(Activity.name.asc()).offset(offset).limit(limit)

    result = await db.execute(stmt)
    activities = result.scalars().all()

    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()

    return {"items": activities, "total": total}
