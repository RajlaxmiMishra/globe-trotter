import uuid
from datetime import date, datetime
from pydantic import BaseModel


class StopCreate(BaseModel):
    city_id: uuid.UUID
    start_date: date
    end_date: date
    order_index: int = 0


class StopUpdate(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    order_index: int | None = None


class CityBrief(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    country: str


class StopOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    trip_id: uuid.UUID
    city_id: uuid.UUID
    start_date: date
    end_date: date
    order_index: int
    created_at: datetime
    city: CityBrief | None = None


class MessageResponse(BaseModel):
    message: str
