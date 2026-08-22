import uuid
from datetime import date, time
from decimal import Decimal
from pydantic import BaseModel


class PublicActivityItem(BaseModel):
    id: uuid.UUID
    activity_id: uuid.UUID
    name: str
    category: str
    scheduled_date: date
    scheduled_time: time | None
    effective_cost: Decimal
    duration_minutes: int | None


class PublicStopItem(BaseModel):
    stop_id: uuid.UUID
    city: str
    country: str
    start_date: date
    end_date: date
    order_index: int
    activities: list[PublicActivityItem]


class PublicTripResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    cover_photo_url: str | None
    start_date: date
    end_date: date
    share_slug: str
    stops: list[PublicStopItem]
