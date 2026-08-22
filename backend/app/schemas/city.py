import uuid
from decimal import Decimal
from pydantic import BaseModel


class CityOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    country: str
    region: str | None
    cost_index: Decimal | None
    popularity_score: Decimal | None
    image_url: str | None


class CityListResponse(BaseModel):
    items: list[CityOut]
    total: int
