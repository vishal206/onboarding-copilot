"""add hr contact to bots

Revision ID: c3d7f2a91b05
Revises: 841ece4a0533
Create Date: 2026-04-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3d7f2a91b05"
down_revision: Union[str, Sequence[str], None] = "841ece4a0533"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("bots", sa.Column("hr_contact_name", sa.String(), nullable=True))
    op.add_column("bots", sa.Column("hr_contact_email", sa.String(), nullable=True))
    op.add_column("bots", sa.Column("hr_contact_slack", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("bots", "hr_contact_slack")
    op.drop_column("bots", "hr_contact_email")
    op.drop_column("bots", "hr_contact_name")
