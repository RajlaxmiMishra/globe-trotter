import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import String, Text, Integer, Numeric, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

VALID_CATEGORIES = {"sightseeing", "food", "adventure", "transport", "stay", "other"}


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("uuid_generate_v4()")
    )
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, server_default="0")
    duration_minutes: Mapped[int | None] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()")
    )

    city: Mapped["City"] = relationship("City", back_populates="activities")
    stop_activities: Mapped[list["StopActivity"]] = relationship(
        "StopActivity", back_populates="activity"
    )
