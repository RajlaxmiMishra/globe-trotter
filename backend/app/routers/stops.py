import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.stop import StopUpdate, StopOut, MessageResponse
from app.schemas.stop_activity import StopActivityCreate, StopActivityOut
from app.services import stop_service, stop_activity_service

router = APIRouter()


@router.patch("/{stop_id}", response_model=StopOut)
async def update_stop(
    stop_id: uuid.UUID,
    body: StopUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await stop_service.update_stop(db, stop_id, current_user.id, body.model_dump(exclude_unset=True))


@router.delete("/{stop_id}", response_model=MessageResponse)
async def delete_stop(
    stop_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await stop_service.delete_stop(db, stop_id, current_user.id)
    return {"message": "Stop removed"}


@router.post("/{stop_id}/activities", response_model=StopActivityOut, status_code=201)
async def add_activity_to_stop(
    stop_id: uuid.UUID,
    body: StopActivityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await stop_activity_service.add_activity_to_stop(db, stop_id, current_user.id, body.model_dump())
