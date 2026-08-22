import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.itinerary import ItineraryResponse, CalendarResponse
from app.services import itinerary_service

router = APIRouter()


@router.get("/{trip_id}/itinerary", response_model=ItineraryResponse)
async def get_itinerary(
    trip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await itinerary_service.get_itinerary(db, trip_id, current_user.id)


@router.get("/{trip_id}/calendar", response_model=CalendarResponse)
async def get_calendar(
    trip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await itinerary_service.get_calendar(db, trip_id, current_user.id)
