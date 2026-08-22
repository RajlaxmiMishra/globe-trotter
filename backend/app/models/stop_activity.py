import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from sqlalchemy import Date, Time, Numeric, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class StopActivity(Base):
    __tablename__ = "stop_activities"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("uuid_generate_v4()")
    )
    stop_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stops.id", ondelete="CASCADE"), nullable=False, index=True
    )
    activity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("activities.id", ondelete="RESTRICT"), nullable=False
    )
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[datetime | None] = mapped_column(Time)
    cost_override: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()")
    )

    stop: Mapped["Stop"] = relationship("Stop", back_populates="stop_activities")
    activity: Mapped["Activity"] = relationship("Activity", back_populates="stop_activities")
