from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime
from sqlalchemy import Column, Enum as PgEnum

class MatchEventType(str, Enum):
    goal = "goal"
    assist = "assist"
    yellow = "yellow"
    red = "red"
    own_goal = "own_goal"
    penalty_saved = "penalty_saved"
    penalty_missed = "penalty_missed"

class MatchEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    match_id: int = Field(foreign_key="match.id")
    player_id: int = Field(foreign_key="player.id")
    event_type: MatchEventType = Field(sa_column=Column(PgEnum(MatchEventType, name="matcheventtype_enum"), name="event_type"))
    minute: int
    assist_player_id: Optional[int] = Field(default=None, foreign_key="player.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
