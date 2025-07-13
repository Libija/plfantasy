from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class FantasyTeam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    favorite_club_id: Optional[int] = Field(default=None, foreign_key="club.id")
    budget: float = Field(default=100.0)  # Početni budžet 100M
    formation: str = Field(default="4-3-3")  # Trenutna formacija
    current_gameweek: int = Field(default=1)  # Trenutno kolo
    total_points: int = Field(default=0)  # Ukupni bodovi
    created_at: datetime = Field(default_factory=datetime.now)
