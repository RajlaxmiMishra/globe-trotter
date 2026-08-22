from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limit import limiter
from app.dependencies import get_db
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.schemas.user import UserSignupOut
from app.services import auth_service
from app.config import settings

router = APIRouter()


@router.post("/signup", response_model=UserSignupOut, status_code=201)
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    user = await auth_service.signup(db, data=body.model_dump())
    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, email=body.email, password=body.password)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh_tokens(db, refresh_token=body.refresh_token)


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("10/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    raw_token = await auth_service.forgot_password(db, email=body.email)

    response: dict = {"message": "If the email exists, a reset link has been sent."}

    # Expose token in dev so frontend/tests can complete the flow without an email server
    if settings.ENVIRONMENT == "development" and raw_token:
        response["reset_token"] = raw_token

    return response


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.reset_password(db, raw_token=body.token, new_password=body.new_password)
    return {"message": "Password updated"}
