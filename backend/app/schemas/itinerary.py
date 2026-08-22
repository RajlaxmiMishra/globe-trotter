import uuid
from datetime import date, time
from decimal import Decimal
from pydantic import BaseModel


class ActivityDetail(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    cost: Decimal
    cost_override: Decimal | None
    effective_cost: Decimal
    cost_unknown: bool
    duration_minutes: int | None
    scheduled_time: time | None
    image_url: str | None


class DayItinerary(BaseModel):
    date: date
    activities: list[ActivityDetail]


class StopItinerary(BaseModel):
    stop_id: uuid.UUID
    city: str
    country: str
    start_date: date
    end_date: date
    order_index: int
    days: list[DayItinerary]


class TripBrief(BaseModel):
    id: uuid.UUID
    name: str
    start_date: date
    end_date: date
    description: str | None
    cover_photo_url: str | None


class ItineraryResponse(BaseModel):
    trip: TripBrief
    stops: list[StopItinerary]


class CalendarActivityItem(BaseModel):
    time: str | None
    name: str
    cost: float
    category: str
    duration_minutes: int | None


class CalendarDay(BaseModel):
    date: date
    activities: list[CalendarActivityItem]


class CalendarResponse(BaseModel):
    days: list[CalendarDay]
