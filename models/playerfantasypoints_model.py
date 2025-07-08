from sqlmodel import SQLModel, Field
from typing import Optional

class PlayerFantasyPoints(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: int = Field(foreign_key="player.id")
    match_id: int = Field(foreign_key="match.id")
    points: int
