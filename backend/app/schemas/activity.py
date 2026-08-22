import uuid
from decimal import Decimal
from pydantic import BaseModel


class ActivityOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    city_id: uuid.UUID
    name: str
    category: str
    cost: Decimal
    duration_minutes: int | None
    description: str | None
    image_url: str | None


class ActivityListResponse(BaseModel):
    items: list[ActivityOut]
    total: int
