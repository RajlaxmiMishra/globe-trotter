from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import OperationalError, TimeoutError as SATimeout


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({"field": ".".join(str(l) for l in error["loc"]), "message": error["msg"]})
    return JSONResponse(status_code=422, content={"detail": errors})


async def db_operational_error_handler(request: Request, exc: OperationalError):
    return JSONResponse(status_code=503, content={"detail": "Service temporarily unavailable. Please try again."})


async def db_timeout_error_handler(request: Request, exc: SATimeout):
    return JSONResponse(status_code=504, content={"detail": "Request timed out. Please try again."})


async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "An unexpected error occurred."})
