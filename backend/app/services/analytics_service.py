from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func, cast, Date, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trip import Trip
from app.models.stop import Stop
from app.models.stop_activity import StopActivity
from app.models.activity import Activity
from app.models.city import City
from app.models.user import User


async def get_analytics(db: AsyncSession) -> dict:
    # --- trips created over time (last 30 days, by day) ---
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).date()

    trips_over_time_result = await db.execute(
        select(
            cast(Trip.created_at, Date).label("date"),
            func.count(Trip.id).label("count"),
        )
        .where(cast(Trip.created_at, Date) >= thirty_days_ago)
        .group_by(cast(Trip.created_at, Date))
        .order_by(cast(Trip.created_at, Date))
    )
    trips_over_time = [
        {"date": str(row.date), "count": row.count}
        for row in trips_over_time_result
    ]

    # --- top 10 cities by number of stops ---
    top_cities_result = await db.execute(
        select(City.name, func.count(Stop.id).label("trip_count"))
        .join(Stop, Stop.city_id == City.id)
        .group_by(City.id, City.name)
        .order_by(func.count(Stop.id).desc())
        .limit(10)
    )
    top_cities = [
        {"name": row.name, "trip_count": row.trip_count}
        for row in top_cities_result
    ]

    # --- top 10 activities by usage ---
    top_activities_result = await db.execute(
        select(Activity.name, func.count(StopActivity.id).label("usage_count"))
        .join(StopActivity, StopActivity.activity_id == Activity.id)
        .group_by(Activity.id, Activity.name)
        .order_by(func.count(StopActivity.id).desc())
        .limit(10)
    )
    top_activities = [
        {"name": row.name, "usage_count": row.usage_count}
        for row in top_activities_result
    ]

    # --- active users: users who created a trip in the last 30 days ---
    active_users_result = await db.execute(
        select(func.count(func.distinct(Trip.user_id)))
        .where(cast(Trip.created_at, Date) >= thirty_days_ago)
    )
    active_users = active_users_result.scalar_one() or 0

    # --- avg trips per user ---
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar_one() or 1

    total_trips_result = await db.execute(select(func.count(Trip.id)))
    total_trips = total_trips_result.scalar_one() or 0

    avg_trips = round(total_trips / total_users, 2)

    return {
        "trips_created_over_time": trips_over_time,
        "top_cities": top_cities,
        "top_activities": top_activities,
        "active_users": active_users,
        "avg_trips_per_user": avg_trips,
    }
