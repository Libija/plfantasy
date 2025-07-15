from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Enum as PgEnum

class MatchStatus(str, Enum):
    SCHEDULED = "scheduled"      # Zakazana
    IN_PROGRESS = "in_progress"  # U toku
    COMPLETED = "completed"      # Završena

class Match(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    home_club_id: int = Field(foreign_key="club.id", description="ID domaćeg kluba")
    away_club_id: int = Field(foreign_key="club.id", description="ID gostujućeg kluba")
    gameweek_id: Optional[int] = Field(default=None, foreign_key="gameweek.id", description="ID kola")
    date: datetime = Field(description="Datum i vrijeme utakmice")
    stadium: str = Field(description="Naziv stadiona")
    referee: Optional[str] = Field(default=None, description="Ime i prezime sudije")
    home_score: Optional[int] = Field(default=None, description="Golovi domaćeg tima")
    away_score: Optional[int] = Field(default=None, description="Golovi gostujućeg tima")
    status: MatchStatus = Field(default=MatchStatus.SCHEDULED, sa_column=Column(PgEnum(MatchStatus, name="matchstatus_enum"), name="status"), description="Status utakmice")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
