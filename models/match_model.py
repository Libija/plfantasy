from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Match(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    home_club_id: int = Field(foreign_key="club.id")
    away_club_id: int = Field(foreign_key="club.id")
    date: datetime
    home_score: Optional[int]
    away_score: Optional[int]
    is_finished: bool = False
    gameweek_id: Optional[int] = Field(default=None, foreign_key="gameweek.id")
