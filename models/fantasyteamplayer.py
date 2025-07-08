from sqlmodel import SQLModel, Field
from typing import Optional

class FantasyTeamPlayer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    fantasy_team_id: int = Field(foreign_key="fantasyteam.id")
    player_id: int = Field(foreign_key="player.id")
