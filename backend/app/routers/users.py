from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdateRequest
from app.schemas.auth import MessageResponse  # shared message schema

router = APIRouter()

_PROFILE_FIELDS = (
    "first_name",
    "last_name",
    "phone_number",
    "city",
    "country",
    "additional_info",
    "photo_url",
    "language_pref",
)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    body: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updates = body.model_dump(exclude_unset=True)
    for field in _PROFILE_FIELDS:
        if field in updates:
            setattr(current_user, field, updates[field])
    current_user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.delete("/me", response_model=MessageResponse)
async def delete_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.delete(current_user)
    await db.commit()
    return {"message": "Account deleted"}
