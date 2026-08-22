"""Add extended user profile fields and split name.

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-22
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("first_name", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("last_name", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("phone_number", sa.String(50), nullable=True))
    op.add_column("users", sa.Column("city", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("country", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("additional_info", sa.Text(), nullable=True))

    op.execute(
        """
        UPDATE users SET
            first_name = SPLIT_PART(name, ' ', 1),
            last_name = NULLIF(TRIM(SUBSTRING(name FROM POSITION(' ' IN name) + 1)), '')
        WHERE name IS NOT NULL AND name <> ''
        """
    )

    op.drop_column("users", "name")


def downgrade() -> None:
    op.add_column("users", sa.Column("name", sa.String(255), nullable=True))

    op.execute(
        """
        UPDATE users SET name = TRIM(
            COALESCE(first_name, '') ||
            CASE WHEN last_name IS NOT NULL AND last_name <> '' THEN ' ' || last_name ELSE '' END
        )
        WHERE first_name IS NOT NULL OR last_name IS NOT NULL
        """
    )

    op.drop_column("users", "additional_info")
    op.drop_column("users", "country")
    op.drop_column("users", "city")
    op.drop_column("users", "phone_number")
    op.drop_column("users", "last_name")
    op.drop_column("users", "first_name")
