import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.activity import ActivityListResponse
from app.services import activity_service

router = APIRouter()


@router.get("", response_model=ActivityListResponse)
async def list_activities(
    city_id: uuid.UUID | None = Query(None),
    category: str | None = Query(None),
    max_cost: Decimal | None = Query(None),
    max_duration: int | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    return await activity_service.list_activities(
        db, city_id=city_id, category=category, max_cost=max_cost,
        max_duration=max_duration, limit=limit, offset=offset,
    )
