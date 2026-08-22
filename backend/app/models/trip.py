import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from sqlalchemy import String, Text, Boolean, Date, Numeric, TIMESTAMP, ForeignKey, CheckConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Trip(Base):
    __tablename__ = "trips"
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="chk_trip_dates"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("uuid_generate_v4()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    cover_photo_url: Mapped[str | None] = mapped_column(String(512))
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    share_slug: Mapped[str | None] = mapped_column(String(32), unique=True, index=True)
    budget_threshold: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
    )

    owner: Mapped["User"] = relationship("User", back_populates="trips")
    stops: Mapped[list["Stop"]] = relationship(
        "Stop", back_populates="trip", cascade="all, delete-orphan", order_by="Stop.order_index"
    )
