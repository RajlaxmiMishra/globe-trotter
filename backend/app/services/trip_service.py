import secrets
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.trip import Trip
from app.models.stop import Stop


def _assert_owner(trip: Trip, user_id) -> None:
    if str(trip.user_id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorised")


async def _get_trip_or_404(db: AsyncSession, trip_id) -> Trip:
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


async def list_trips(db: AsyncSession, user_id, limit: int, offset: int, upcoming: bool | None):
    stmt = select(Trip).where(Trip.user_id == user_id)
    if upcoming:
        stmt = stmt.where(Trip.end_date >= datetime.now(timezone.utc).date())
    stmt = stmt.order_by(Trip.start_date.asc()).offset(offset).limit(limit)

    count_stmt = select(func.count()).select_from(Trip).where(Trip.user_id == user_id)
    if upcoming:
        count_stmt = count_stmt.where(Trip.end_date >= datetime.now(timezone.utc).date())

    trips_result = await db.execute(stmt)
    trips = trips_result.scalars().all()

    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()

    # Attach stop_count without loading full stops
    items = []
    for trip in trips:
        sc_result = await db.execute(select(func.count()).select_from(Stop).where(Stop.trip_id == trip.id))
        stop_count = sc_result.scalar_one()
        items.append({
            "id": trip.id,
            "name": trip.name,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "stop_count": stop_count,
        })

    return {"items": items, "total": total}


async def create_trip(db: AsyncSession, user_id, data: dict) -> Trip:
    trip = Trip(user_id=user_id, **data)
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return trip


async def get_trip(db: AsyncSession, trip_id, user_id) -> dict:
    result = await db.execute(
        select(Trip).options(selectinload(Trip.stops)).where(Trip.id == trip_id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    if str(trip.user_id) != str(user_id) and not trip.is_public:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorised")

    return {"trip": trip, "stop_count": len(trip.stops)}


async def update_trip(db: AsyncSession, trip_id, user_id, data: dict) -> Trip:
    trip = await _get_trip_or_404(db, trip_id)
    _assert_owner(trip, user_id)

    for key, val in data.items():
        if val is not None:
            setattr(trip, key, val)

    # Generate slug when making public; clear when making private
    if "is_public" in data:
        if data["is_public"] and not trip.share_slug:
            trip.share_slug = await _generate_unique_slug(db)
        elif not data["is_public"]:
            trip.share_slug = None

    trip.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(trip)
    return trip


async def delete_trip(db: AsyncSession, trip_id, user_id) -> None:
    trip = await _get_trip_or_404(db, trip_id)
    _assert_owner(trip, user_id)
    await db.delete(trip)
    await db.commit()


async def set_budget_threshold(db: AsyncSession, trip_id, user_id, threshold: Decimal) -> Trip:
    trip = await _get_trip_or_404(db, trip_id)
    _assert_owner(trip, user_id)
    trip.budget_threshold = threshold
    trip.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(trip)
    return trip


async def _generate_unique_slug(db: AsyncSession) -> str:
    for _ in range(10):
        slug = secrets.token_urlsafe(16)[:22]
        result = await db.execute(select(Trip).where(Trip.share_slug == slug))
        if not result.scalar_one_or_none():
            return slug
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not generate share slug")
