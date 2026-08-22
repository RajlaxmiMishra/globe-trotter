from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.city import CityListResponse
from app.services import city_service

router = APIRouter()


@router.get("", response_model=CityListResponse)
async def list_cities(
    q: str | None = Query(None),
    country: str | None = Query(None),
    region: str | None = Query(None),
    sort: str = Query("popularity"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    return await city_service.list_cities(db, q=q, country=country, region=region, sort=sort, limit=limit, offset=offset)
