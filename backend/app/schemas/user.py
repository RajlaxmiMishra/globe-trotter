import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: EmailStr
    name: str | None
    photo_url: str | None
    language_pref: str
    role: str
    created_at: datetime


class UserSignupOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: EmailStr
    name: str | None
    created_at: datetime


class UserUpdateRequest(BaseModel):
    name: str | None = None
    photo_url: str | None = None
    language_pref: str | None = None
