from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.user import User
from app.schemas.admin import AnalyticsResponse
from app.services import analytics_service

router = APIRouter()


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin-only (NFR-008). Returns aggregate platform stats — never individual private trip data (BR-R007)."""
    return await analytics_service.get_analytics(db)
