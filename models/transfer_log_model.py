from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class TransferType(str, Enum):
    IN = "in"      # Igrač ulazi u tim
    OUT = "out"    # Igrač izlazi iz tima

class TransferLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    fantasy_team_id: int = Field(foreign_key="fantasyteam.id")
    player_in_id: Optional[int] = Field(default=None, foreign_key="player.id")
    player_out_id: Optional[int] = Field(default=None, foreign_key="player.id")
    transfer_type: TransferType
    gameweek: int = Field(description="Kolo u kojem je transfer napravljen")
    cost: float = Field(description="Trošak transfera")
    budget_before: float = Field(description="Budžet prije transfera")
    budget_after: float = Field(description="Budžet nakon transfera")
    created_at: datetime = Field(default_factory=datetime.utcnow) 