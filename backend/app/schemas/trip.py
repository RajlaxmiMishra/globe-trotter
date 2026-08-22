import uuid
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator, model_validator


class TripCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    description: str | None = None
    cover_photo_url: str | None = None

    @model_validator(mode="after")
    def end_after_start(self) -> "TripCreate":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class TripUpdate(BaseModel):
    name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None
    cover_photo_url: str | None = None
    is_public: bool | None = None


class BudgetThresholdUpdate(BaseModel):
    budget_threshold: Decimal


class TripSummary(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    start_date: date
    end_date: date
    stop_count: int = 0


class TripOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    description: str | None = None
    cover_photo_url: str | None = None
    start_date: date
    end_date: date
    is_public: bool
    share_slug: str | None = None
    budget_threshold: Decimal | None = None
    created_at: datetime
    updated_at: datetime
    stop_count: int = 0


class TripListResponse(BaseModel):
    items: list[TripSummary]
    total: int


class MessageResponse(BaseModel):
    message: str
