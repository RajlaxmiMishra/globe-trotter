from pydantic import BaseModel


class DateCount(BaseModel):
    date: str
    count: int


class CityUsage(BaseModel):
    name: str
    trip_count: int


class ActivityUsage(BaseModel):
    name: str
    usage_count: int


class AnalyticsResponse(BaseModel):
    trips_created_over_time: list[DateCount]
    top_cities: list[CityUsage]
    top_activities: list[ActivityUsage]
    active_users: int
    avg_trips_per_user: float
