import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, computed_field


class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: EmailStr
    first_name: str | None
    last_name: str | None
    phone_number: str | None
    city: str | None
    country: str | None
    additional_info: str | None
    photo_url: str | None
    language_pref: str
    role: str
    created_at: datetime

    @computed_field
    @property
    def name(self) -> str:
        parts = [p for p in (self.first_name, self.last_name) if p]
        return " ".join(parts)


class UserSignupOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: EmailStr
    first_name: str | None
    last_name: str | None
    phone_number: str | None
    city: str | None
    country: str | None
    additional_info: str | None
    photo_url: str | None
    created_at: datetime

    @computed_field
    @property
    def name(self) -> str:
        parts = [p for p in (self.first_name, self.last_name) if p]
        return " ".join(parts)


class UserUpdateRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    city: str | None = None
    country: str | None = None
    additional_info: str | None = None
    photo_url: str | None = None
    language_pref: str | None = None
