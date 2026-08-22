import uuid
from datetime import date, time, datetime
from decimal import Decimal
from pydantic import BaseModel


class StopActivityCreate(BaseModel):
    activity_id: uuid.UUID
    scheduled_date: date
    scheduled_time: time | None = None
    cost_override: Decimal | None = None


class StopActivityOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    stop_id: uuid.UUID
    activity_id: uuid.UUID
    scheduled_date: date
    scheduled_time: time | None
    cost_override: Decimal | None
    created_at: datetime


class MessageResponse(BaseModel):
    message: str
