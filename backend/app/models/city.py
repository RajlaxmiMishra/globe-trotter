import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import String, Numeric, TIMESTAMP, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class City(Base):
    __tablename__ = "cities"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("uuid_generate_v4()")
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    region: Mapped[str | None] = mapped_column(String(255))
    cost_index: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    popularity_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    image_url: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()")
    )

    stops: Mapped[list["Stop"]] = relationship("Stop", back_populates="city")
    activities: Mapped[list["Activity"]] = relationship(
        "Activity", back_populates="city", cascade="all, delete-orphan"
    )
