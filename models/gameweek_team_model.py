from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class GameweekTeam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", description="ID korisnika")
    gameweek_id: int = Field(foreign_key="gameweek.id", description="ID kola")
    formation: str = Field(description="Formacija u tom kolu")
    captain_id: int = Field(foreign_key="player.id", description="ID kapiten igrača")
    vice_captain_id: int = Field(foreign_key="player.id", description="ID vice-kapiten igrača")
    total_points: float = Field(default=0.0, description="Ukupni poeni tima")
    created_at: datetime = Field(default_factory=datetime.utcnow) 
    budget_snapshot: Optional[float] = Field(default=None)