from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class MatchStatistics(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    match_id: int = Field(foreign_key="match.id", description="ID utakmice")
    club_id: int = Field(foreign_key="club.id", description="ID kluba")
    
    # Osnovne statistike
    possession: int = Field(description="Posjed lopte u procentima")
    shots: int = Field(description="Ukupno šuteva")
    shots_on_target: int = Field(description="Šutevi u okvir")
    corners: int = Field(description="Korneri")
    fouls: int = Field(description="Prekršaji")
    yellow_cards: int = Field(description="Žuti kartoni")
    red_cards: int = Field(description="Crveni kartoni")
    offsides: int = Field(description="Ofsajdi")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow) 