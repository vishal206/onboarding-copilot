"""pricing refactor: pages, employees, usage events

Revision ID: a1b2c3d4e5f6
Revises: c3d7f2a91b05
Create Date: 2026-05-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "23d1984e11ea"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("bots", sa.Column("employees_covered", sa.Integer(), nullable=False, server_default="10"))
    op.add_column("bots", sa.Column("pages_indexed_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("documents", sa.Column("page_count", sa.Integer(), nullable=False, server_default="0"))

    op.create_table(
        "usage_events",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("bot_id", sa.String(), sa.ForeignKey("bots.id"), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("input_tokens", sa.Integer(), nullable=False),
        sa.Column("output_tokens", sa.Integer(), nullable=False),
        sa.Column("cost_usd", sa.Numeric(10, 6), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_usage_events_bot_id_created_at", "usage_events", ["bot_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_usage_events_bot_id_created_at", table_name="usage_events")
    op.drop_table("usage_events")
    op.drop_column("documents", "page_count")
    op.drop_column("bots", "pages_indexed_count")
    op.drop_column("bots", "employees_covered")
