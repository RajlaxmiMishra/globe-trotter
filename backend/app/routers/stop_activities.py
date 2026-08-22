import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.stop_activity import MessageResponse
from app.services import stop_activity_service

router = APIRouter()


@router.delete("/{stop_activity_id}", response_model=MessageResponse)
async def remove_activity(
    stop_activity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await stop_activity_service.remove_activity(db, stop_activity_id, current_user.id)
    return {"message": "Activity removed"}
