from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class GameweekPlayer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    gameweek_team_id: int = Field(foreign_key="gameweekteam.id", description="ID gameweek tima")
    player_id: int = Field(foreign_key="player.id", description="ID igrača")
    position: str = Field(description="Pozicija igrača (GK, DF, MF, FW)")
    is_bench: bool = Field(default=False, description="Da li je na klupi")
    points: float = Field(default=0.0, description="Poeni igrača")
    created_at: datetime = Field(default_factory=datetime.utcnow) 