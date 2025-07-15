from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from sqlalchemy import Column, Enum as PgEnum

class PlayerRole(str, Enum):
    CAPTAIN = "captain"
    VICE_CAPTAIN = "vice_captain"
    BENCH = "bench"
    REGULAR = "regular"

class FantasyTeamPlayer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    fantasy_team_id: int = Field(foreign_key="fantasyteam.id")
    player_id: int = Field(foreign_key="player.id")
    role: PlayerRole = Field(default=PlayerRole.REGULAR, sa_column=Column(PgEnum(PlayerRole, name="playerrole_enum"), name="role"))
    formation_position: Optional[str] = Field(default=None)  # "GK", "DF1", "MF1", "FW1", "GK_BENCH", etc.
    squad_number: Optional[int] = Field(default=None)  # Redni broj u timu (1-15)
    is_captain: bool = Field(default=False)
    is_vice_captain: bool = Field(default=False)
