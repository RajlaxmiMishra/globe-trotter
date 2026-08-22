from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.public import PublicTripResponse
from app.schemas.trip import TripOut
from app.services import sharing_service

router = APIRouter()


@router.get("/trips/{share_slug}", response_model=PublicTripResponse)
async def get_public_trip(
    share_slug: str,
    db: AsyncSession = Depends(get_db),
):
    """No auth required. Never exposes owner email or private fields (NFR-007)."""
    return await sharing_service.get_public_trip(db, share_slug)


@router.post("/trips/{share_slug}/copy", response_model=TripOut, status_code=201)
async def copy_public_trip(
    share_slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Auth required (401 if not logged in). Duplicates the trip into caller's account."""
    new_trip = await sharing_service.copy_public_trip(db, share_slug, current_user.id)
    # Count stops on the new trip
    from sqlalchemy import select, func
    from app.models.stop import Stop
    sc_result = await db.execute(select(func.count()).select_from(Stop).where(Stop.trip_id == new_trip.id))
    stop_count = sc_result.scalar_one()

    from app.routers.trips import _trip_out
    return _trip_out(new_trip, stop_count)
