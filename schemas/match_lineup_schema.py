from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.match_lineup_model import LineupType

class MatchLineupCreate(BaseModel):
    match_id: int
    player_id: int
    club_id: int
    lineup_type: LineupType
    shirt_number: int
    position: str
    is_captain: bool = False

class MatchLineupBulkCreate(BaseModel):
    match_id: int
    lineups: List[MatchLineupCreate]

class MatchLineupUpdate(BaseModel):
    shirt_number: Optional[int] = None
    position: Optional[str] = None
    is_captain: Optional[bool] = None

class MatchLineupResponse(BaseModel):
    id: int
    match_id: int
    player_id: int
    club_id: int
    lineup_type: LineupType
    shirt_number: int
    position: str
    is_captain: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MatchLineupWithPlayerResponse(BaseModel):
    id: int
    match_id: int
    player_id: int
    player_name: str
    club_id: int
    club_name: str
    lineup_type: LineupType
    shirt_number: int
    position: str
    is_captain: bool
    created_at: datetime

    class Config:
        from_attributes = True 