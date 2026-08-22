from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.stop import Stop
from app.models.trip import Trip
from app.models.activity import Activity
from app.models.stop_activity import StopActivity


async def _get_stop_with_trip(db: AsyncSession, stop_id) -> tuple[Stop, Trip]:
    result = await db.execute(select(Stop).where(Stop.id == stop_id))
    stop = result.scalar_one_or_none()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found")

    trip_result = await db.execute(select(Trip).where(Trip.id == stop.trip_id))
    trip = trip_result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    return stop, trip


async def add_activity_to_stop(db: AsyncSession, stop_id, user_id, data: dict) -> StopActivity:
    stop, trip = await _get_stop_with_trip(db, stop_id)

    if str(trip.user_id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorised")

    # Validate activity exists
    act_result = await db.execute(select(Activity).where(Activity.id == data["activity_id"]))
    if not act_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    scheduled_date = data["scheduled_date"]

    # SRS edge case: activity scheduled_date must be within stop's date range
    if scheduled_date < stop.start_date or scheduled_date > stop.end_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"scheduled_date must be within stop date range ({stop.start_date} – {stop.end_date})",
        )

    sa = StopActivity(stop_id=stop_id, **data)
    db.add(sa)
    await db.commit()
    await db.refresh(sa)
    return sa


async def remove_activity(db: AsyncSession, stop_activity_id, user_id) -> None:
    result = await db.execute(select(StopActivity).where(StopActivity.id == stop_activity_id))
    sa = result.scalar_one_or_none()
    if not sa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop-activity not found")

    _, trip = await _get_stop_with_trip(db, sa.stop_id)
    if str(trip.user_id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorised")

    await db.delete(sa)
    await db.commit()
