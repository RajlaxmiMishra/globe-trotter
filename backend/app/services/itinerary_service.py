from datetime import date, timedelta
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.trip import Trip
from app.models.stop import Stop
from app.models.stop_activity import StopActivity
from app.models.activity import Activity
from app.models.city import City


async def _load_trip_for_user(db: AsyncSession, trip_id, user_id) -> Trip:
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    if str(trip.user_id) != str(user_id) and not trip.is_public:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorised")
    return trip


async def _load_stops_with_activities(db: AsyncSession, trip_id) -> list[Stop]:
    result = await db.execute(
        select(Stop)
        .where(Stop.trip_id == trip_id)
        .options(
            selectinload(Stop.city),
            selectinload(Stop.stop_activities).selectinload(StopActivity.activity),
        )
        .order_by(Stop.order_index, Stop.start_date)
    )
    return result.scalars().all()


def _effective_cost(sa: StopActivity) -> tuple[Decimal, bool]:
    """Return (effective_cost, cost_unknown).
    cost_unknown = True when no explicit cost exists and no override was provided.
    """
    if sa.cost_override is not None:
        return sa.cost_override, False
    activity_cost = sa.activity.cost if sa.activity else Decimal("0")
    cost_unknown = activity_cost == Decimal("0")
    return activity_cost, cost_unknown


def _date_range(start: date, end: date) -> list[date]:
    days = []
    cur = start
    while cur <= end:
        days.append(cur)
        cur += timedelta(days=1)
    return days


async def get_itinerary(db: AsyncSession, trip_id, user_id) -> dict:
    trip = await _load_trip_for_user(db, trip_id, user_id)
    stops = await _load_stops_with_activities(db, trip_id)

    stops_payload = []
    for stop in stops:
        # Build a day-keyed dict
        day_map: dict[date, list] = {d: [] for d in _date_range(stop.start_date, stop.end_date)}

        for sa in sorted(stop.stop_activities, key=lambda x: (x.scheduled_date, x.scheduled_time or "")):
            eff_cost, cost_unknown = _effective_cost(sa)
            act = sa.activity
            day_map.setdefault(sa.scheduled_date, []).append({
                "id": sa.id,
                "name": act.name if act else "Unknown",
                "category": act.category if act else "other",
                "cost": act.cost if act else Decimal("0"),
                "cost_override": sa.cost_override,
                "effective_cost": eff_cost,
                "cost_unknown": cost_unknown,
                "duration_minutes": act.duration_minutes if act else None,
                "scheduled_time": sa.scheduled_time,
                "image_url": act.image_url if act else None,
            })

        days = [{"date": d, "activities": day_map[d]} for d in sorted(day_map.keys())]

        stops_payload.append({
            "stop_id": stop.id,
            "city": stop.city.name if stop.city else "",
            "country": stop.city.country if stop.city else "",
            "start_date": stop.start_date,
            "end_date": stop.end_date,
            "order_index": stop.order_index,
            "days": days,
        })

    return {
        "trip": {
            "id": trip.id,
            "name": trip.name,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "description": trip.description,
            "cover_photo_url": trip.cover_photo_url,
        },
        "stops": stops_payload,
    }


async def get_calendar(db: AsyncSession, trip_id, user_id) -> dict:
    trip = await _load_trip_for_user(db, trip_id, user_id)
    stops = await _load_stops_with_activities(db, trip_id)

    # Flatten all days of the trip
    day_map: dict[date, list] = {d: [] for d in _date_range(trip.start_date, trip.end_date)}

    for stop in stops:
        for sa in sorted(stop.stop_activities, key=lambda x: (x.scheduled_date, x.scheduled_time or "")):
            act = sa.activity
            eff_cost, _ = _effective_cost(sa)
            day_map.setdefault(sa.scheduled_date, []).append({
                "time": str(sa.scheduled_time) if sa.scheduled_time else None,
                "name": act.name if act else "Unknown",
                "cost": float(eff_cost),
                "category": act.category if act else "other",
                "duration_minutes": act.duration_minutes if act else None,
            })

    days = [{"date": d, "activities": day_map[d]} for d in sorted(day_map.keys())]
    return {"days": days}


async def get_budget(db: AsyncSession, trip_id, user_id) -> dict:
    trip = await _load_trip_for_user(db, trip_id, user_id)
    stops = await _load_stops_with_activities(db, trip_id)

    # Category → budget bucket mapping
    CATEGORY_BUCKET = {
        "transport": "transport",
        "stay": "stay",
        "sightseeing": "activities",
        "adventure": "activities",
        "food": "meals",
        "other": "meals",
    }

    breakdown = {"transport": Decimal("0"), "stay": Decimal("0"), "activities": Decimal("0"), "meals": Decimal("0")}
    per_day_costs: dict[date, Decimal] = {}

    for stop in stops:
        for sa in stop.stop_activities:
            eff_cost, _ = _effective_cost(sa)
            act = sa.activity
            category = act.category if act else "other"
            bucket = CATEGORY_BUCKET.get(category, "meals")
            breakdown[bucket] += eff_cost
            per_day_costs[sa.scheduled_date] = per_day_costs.get(sa.scheduled_date, Decimal("0")) + eff_cost

    total = sum(breakdown.values())

    # Build per_day list over entire trip date range
    all_days = _date_range(trip.start_date, trip.end_date)
    num_days = len(all_days) or 1
    avg = total / num_days

    threshold = trip.budget_threshold
    per_day = []
    for d in all_days:
        day_cost = per_day_costs.get(d, Decimal("0"))
        # "over_budget" per day: day cost > avg threshold (if set) or proportional share
        daily_threshold = (threshold / num_days) if threshold else None
        over = bool(daily_threshold and day_cost > daily_threshold)
        per_day.append({"date": d, "cost": day_cost, "over_budget": over})

    return {
        "total_estimated_cost": total,
        "average_cost_per_day": avg,
        "breakdown": breakdown,
        "per_day": per_day,
        "budget_threshold": threshold,
        "is_over_budget": bool(threshold and total > threshold),
    }
