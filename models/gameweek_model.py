from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Enum as PgEnum

class GameweekStatus(str, Enum):
    SCHEDULED = "scheduled"      # Zakazano
    IN_PROGRESS = "in_progress"  # U toku
    COMPLETED = "completed"      # Završeno

class Gameweek(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    number: int = Field(description="Broj kola (1-33)")
    season: str = Field(description="Sezona (npr. 2024/25)")
    start_date: datetime = Field(description="Datum početka kola")
    end_date: datetime = Field(description="Datum završetka kola")
    status: GameweekStatus = Field(default=GameweekStatus.SCHEDULED, sa_column=Column(PgEnum(GameweekStatus, name="gameweekstatus_enum"), name="status"), description="Status kola")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
