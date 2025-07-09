from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MatchSubstitutionCreate(BaseModel):
    match_id: int
    club_id: int
    player_out_id: int
    player_in_id: int
    minute: int

class MatchSubstitutionUpdate(BaseModel):
    player_out_id: Optional[int] = None
    player_in_id: Optional[int] = None
    minute: Optional[int] = None

class MatchSubstitutionResponse(BaseModel):
    id: int
    match_id: int
    club_id: int
    player_out_id: int
    player_in_id: int
    minute: int
    created_at: datetime

    class Config:
        from_attributes = True

class MatchSubstitutionWithPlayersResponse(BaseModel):
    id: int
    match_id: int
    club_id: int
    club_name: str
    player_out_id: int
    player_out_name: str
    player_in_id: int
    player_in_name: str
    minute: int
    created_at: datetime

    class Config:
        from_attributes = True 