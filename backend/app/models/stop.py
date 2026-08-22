import uuid
from datetime import date, datetime, timezone
from sqlalchemy import Integer, Date, TIMESTAMP, ForeignKey, CheckConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Stop(Base):
    __tablename__ = "stops"
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="chk_stop_dates"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("uuid_generate_v4()")
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()")
    )

    trip: Mapped["Trip"] = relationship("Trip", back_populates="stops")
    city: Mapped["City"] = relationship("City", back_populates="stops")
    stop_activities: Mapped[list["StopActivity"]] = relationship(
        "StopActivity", back_populates="stop", cascade="all, delete-orphan"
    )
