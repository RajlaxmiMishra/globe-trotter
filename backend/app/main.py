from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy.exc import OperationalError

from app.core.exceptions import (
    validation_exception_handler,
    db_operational_error_handler,
    generic_exception_handler,
)
from app.core.rate_limit import limiter
from app.routers import auth, users, trips, stops, cities, activities, stop_activities, itinerary, budget, public, admin

app = FastAPI(
    title="GlobeTrotter API",
    version="1.0.0",
    description="Multi-city travel planning platform API",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(OperationalError, db_operational_error_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(trips.router, prefix="/api/v1/trips", tags=["trips"])
app.include_router(stops.router, prefix="/api/v1/stops", tags=["stops"])
app.include_router(cities.router, prefix="/api/v1/cities", tags=["cities"])
app.include_router(activities.router, prefix="/api/v1/activities", tags=["activities"])
app.include_router(stop_activities.router, prefix="/api/v1/stop-activities", tags=["stop-activities"])
app.include_router(itinerary.router, prefix="/api/v1/trips", tags=["itinerary"])
app.include_router(budget.router, prefix="/api/v1/trips", tags=["budget"])
app.include_router(public.router, prefix="/api/v1/public", tags=["public"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy", "version": "1.0.0"}
