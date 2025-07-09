from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class MatchSubstitution(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    match_id: int = Field(foreign_key="match.id", description="ID utakmice")
    club_id: int = Field(foreign_key="club.id", description="ID kluba")
    player_out_id: int = Field(foreign_key="player.id", description="ID igrača koji izlazi")
    player_in_id: int = Field(foreign_key="player.id", description="ID igrača koji ulazi")
    minute: int = Field(description="Minuta izmjene")
    created_at: datetime = Field(default_factory=datetime.utcnow) 