import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.trip import TripCreate, TripUpdate, TripOut, TripListResponse, BudgetThresholdUpdate, MessageResponse
from app.schemas.stop import StopCreate, StopOut
from app.services import trip_service, stop_service

router = APIRouter()


def _trip_out(trip, stop_count: int) -> TripOut:
    return TripOut(
        id=trip.id,
        name=trip.name,
        description=trip.description,
        cover_photo_url=trip.cover_photo_url,
        start_date=trip.start_date,
        end_date=trip.end_date,
        is_public=trip.is_public,
        share_slug=trip.share_slug,
        budget_threshold=trip.budget_threshold,
        created_at=trip.created_at,
        updated_at=trip.updated_at,
        stop_count=stop_count,
    )


@router.get("", response_model=TripListResponse)
async def list_trips(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    upcoming: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await trip_service.list_trips(db, current_user.id, limit, offset, upcoming)


@router.post("", response_model=TripOut, status_code=201)
async def create_trip(
    body: TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = await trip_service.create_trip(db, current_user.id, body.model_dump())
    return _trip_out(trip, 0)


@router.get("/{trip_id}", response_model=TripOut)
async def get_trip(
    trip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await trip_service.get_trip(db, trip_id, current_user.id)
    return _trip_out(result["trip"], result["stop_count"])


@router.patch("/{trip_id}", response_model=TripOut)
async def update_trip(
    trip_id: uuid.UUID,
    body: TripUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = body.model_dump(exclude_unset=True)
    trip = await trip_service.update_trip(db, trip_id, current_user.id, data)
    sc_result = await trip_service.get_trip(db, trip.id, current_user.id)
    return _trip_out(trip, sc_result["stop_count"])


@router.delete("/{trip_id}", response_model=MessageResponse)
async def delete_trip(
    trip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await trip_service.delete_trip(db, trip_id, current_user.id)
    return {"message": "Trip deleted"}


@router.patch("/{trip_id}/budget-threshold", response_model=TripOut)
async def set_budget_threshold(
    trip_id: uuid.UUID,
    body: BudgetThresholdUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = await trip_service.set_budget_threshold(db, trip_id, current_user.id, body.budget_threshold)
    sc_result = await trip_service.get_trip(db, trip.id, current_user.id)
    return _trip_out(trip, sc_result["stop_count"])


@router.post("/{trip_id}/stops", response_model=StopOut, status_code=201)
async def add_stop(
    trip_id: uuid.UUID,
    body: StopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await stop_service.add_stop(db, trip_id, current_user.id, body.model_dump())
