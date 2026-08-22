from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.trip import Trip
from app.models.stop import Stop
from app.models.stop_activity import StopActivity
from app.services.itinerary_service import _load_stops_with_activities


async def get_public_trip(db: AsyncSession, share_slug: str) -> dict:
    result = await db.execute(
        select(Trip).where(Trip.share_slug == share_slug, Trip.is_public.is_(True))
    )
    trip = result.scalar_one_or_none()

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found or is no longer shared",
        )

    stops = await _load_stops_with_activities(db, trip.id)
    stops_payload = _build_public_stops(stops)

    # NFR-007: never expose owner email, hashed_password, or private profile fields
    return {
        "id": trip.id,
        "name": trip.name,
        "description": trip.description,
        "cover_photo_url": trip.cover_photo_url,
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "share_slug": trip.share_slug,
        "stops": stops_payload,
    }


def _build_public_stops(stops: list[Stop]) -> list[dict]:
    result = []
    for stop in stops:
        activities = []
        for sa in sorted(stop.stop_activities, key=lambda x: (x.scheduled_date, x.scheduled_time or "")):
            act = sa.activity
            effective_cost = sa.cost_override if sa.cost_override is not None else (act.cost if act else 0)
            activities.append({
                "id": sa.id,
                "activity_id": sa.activity_id,
                "name": act.name if act else "Unknown",
                "category": act.category if act else "other",
                "scheduled_date": sa.scheduled_date,
                "scheduled_time": sa.scheduled_time,
                "effective_cost": effective_cost,
                "duration_minutes": act.duration_minutes if act else None,
            })
        result.append({
            "stop_id": stop.id,
            "city": stop.city.name if stop.city else "",
            "country": stop.city.country if stop.city else "",
            "start_date": stop.start_date,
            "end_date": stop.end_date,
            "order_index": stop.order_index,
            "activities": activities,
        })
    return result


async def copy_public_trip(db: AsyncSession, share_slug: str, user_id) -> Trip:
    """Duplicate a public trip (stops + stop_activities) into the caller's account."""
    result = await db.execute(
        select(Trip).where(Trip.share_slug == share_slug, Trip.is_public.is_(True))
    )
    source_trip = result.scalar_one_or_none()

    if not source_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found or is no longer shared",
        )

    stops = await _load_stops_with_activities(db, source_trip.id)

    # Create new trip owned by caller — not public, no share_slug
    new_trip = Trip(
        user_id=user_id,
        name=f"{source_trip.name} (copy)",
        description=source_trip.description,
        cover_photo_url=source_trip.cover_photo_url,
        start_date=source_trip.start_date,
        end_date=source_trip.end_date,
        is_public=False,
        share_slug=None,
        budget_threshold=source_trip.budget_threshold,
    )
    db.add(new_trip)
    await db.flush()  # get new_trip.id without committing

    for stop in stops:
        new_stop = Stop(
            trip_id=new_trip.id,
            city_id=stop.city_id,
            start_date=stop.start_date,
            end_date=stop.end_date,
            order_index=stop.order_index,
        )
        db.add(new_stop)
        await db.flush()

        for sa in stop.stop_activities:
            new_sa = StopActivity(
                stop_id=new_stop.id,
                activity_id=sa.activity_id,
                scheduled_date=sa.scheduled_date,
                scheduled_time=sa.scheduled_time,
                cost_override=sa.cost_override,
            )
            db.add(new_sa)

    await db.commit()
    await db.refresh(new_trip)
    return new_trip
