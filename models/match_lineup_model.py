from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class LineupType(str, Enum):
    STARTING = "starting"    # Prva postava
    SUBSTITUTE = "substitute"  # Klupa

class MatchLineup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    match_id: int = Field(foreign_key="match.id", description="ID utakmice")
    player_id: int = Field(foreign_key="player.id", description="ID igrača")
    club_id: int = Field(foreign_key="club.id", description="ID kluba")
    lineup_type: LineupType = Field(description="Tip postave (prva postava ili klupa)")
    shirt_number: int = Field(description="Broj dresa")
    position: str = Field(description="Pozicija igrača (GK, DEF, MID, FWD)")
    is_captain: bool = Field(default=False, description="Da li je kapiten")
    created_at: datetime = Field(default_factory=datetime.utcnow) 