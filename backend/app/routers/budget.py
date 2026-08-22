import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.budget import BudgetResponse
from app.services import itinerary_service

router = APIRouter()


@router.get("/{trip_id}/budget", response_model=BudgetResponse)
async def get_budget(
    trip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await itinerary_service.get_budget(db, trip_id, current_user.id)
