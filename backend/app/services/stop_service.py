from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.stop import Stop
from app.models.trip import Trip
from app.models.city import City


async def _get_trip_or_404(db: AsyncSession, trip_id) -> Trip:
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


async def _get_stop_or_404(db: AsyncSession, stop_id) -> Stop:
    result = await db.execute(
        select(Stop).options(selectinload(Stop.city)).where(Stop.id == stop_id)
    )
    stop = result.scalar_one_or_none()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found")
    return stop


def _assert_owner(trip: Trip, user_id) -> None:
    if str(trip.user_id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorised")


async def add_stop(db: AsyncSession, trip_id, user_id, data: dict) -> Stop:
    trip = await _get_trip_or_404(db, trip_id)
    _assert_owner(trip, user_id)

    # Validate city exists
    city_result = await db.execute(select(City).where(City.id == data["city_id"]))
    if not city_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found")

    start_date = data["start_date"]
    end_date = data["end_date"]

    # BR-R001: stop dates must be within trip date range
    if start_date < trip.start_date or end_date > trip.end_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Stop dates must fall within the trip date range "
                   f"({trip.start_date} – {trip.end_date})",
        )

    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Stop end_date must be on or after start_date",
        )

    stop = Stop(trip_id=trip_id, **data)
    db.add(stop)
    await db.commit()
    await db.refresh(stop)

    # Reload with city relationship
    return await _get_stop_or_404(db, stop.id)


async def update_stop(db: AsyncSession, stop_id, user_id, data: dict) -> Stop:
    stop = await _get_stop_or_404(db, stop_id)

    # Load parent trip to verify ownership and date constraints
    trip = await _get_trip_or_404(db, stop.trip_id)
    _assert_owner(trip, user_id)

    new_start = data.get("start_date") or stop.start_date
    new_end = data.get("end_date") or stop.end_date
    new_order = data.get("order_index")

    if new_end < new_start:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_date must be on or after start_date",
        )

    if new_start < trip.start_date or new_end > trip.end_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Stop dates must fall within the trip date range",
        )

    stop.start_date = new_start
    stop.end_date = new_end
    if new_order is not None:
        stop.order_index = new_order

    await db.commit()

    # Re-normalise order_index for all stops in the trip (SRS edge case)
    await _renormalise_order(db, stop.trip_id)

    return await _get_stop_or_404(db, stop_id)


async def delete_stop(db: AsyncSession, stop_id, user_id) -> None:
    stop = await _get_stop_or_404(db, stop_id)
    trip = await _get_trip_or_404(db, stop.trip_id)
    _assert_owner(trip, user_id)
    await db.delete(stop)
    await db.commit()
    await _renormalise_order(db, stop.trip_id)


async def _renormalise_order(db: AsyncSession, trip_id) -> None:
    """Re-index order_index sequentially (0, 1, 2…) ordered by current order_index."""
    result = await db.execute(
        select(Stop).where(Stop.trip_id == trip_id).order_by(Stop.order_index, Stop.created_at)
    )
    stops = result.scalars().all()
    for i, s in enumerate(stops):
        s.order_index = i
    await db.commit()
