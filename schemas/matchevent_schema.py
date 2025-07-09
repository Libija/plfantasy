from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.matchevent_model import MatchEventType

class MatchEventCreate(BaseModel):
    match_id: int
    player_id: int
    event_type: MatchEventType
    minute: int
    assist_player_id: Optional[int] = None

class MatchEventUpdate(BaseModel):
    player_id: Optional[int] = None
    event_type: Optional[MatchEventType] = None
    minute: Optional[int] = None
    assist_player_id: Optional[int] = None

class MatchEventResponse(BaseModel):
    id: int
    match_id: int
    player_id: int
    event_type: MatchEventType
    minute: int
    assist_player_id: Optional[int] = None
    player_name: Optional[str] = None
    club_name: Optional[str] = None
    assist_player_name: Optional[str] = None

    class Config:
        from_attributes = True 