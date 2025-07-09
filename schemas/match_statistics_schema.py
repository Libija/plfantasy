from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MatchStatisticsCreate(BaseModel):
    match_id: int
    club_id: int
    possession: int
    shots: int
    shots_on_target: int
    corners: int
    fouls: int
    yellow_cards: int
    red_cards: int
    offsides: int

class MatchStatisticsUpdate(BaseModel):
    possession: Optional[int] = None
    shots: Optional[int] = None
    shots_on_target: Optional[int] = None
    corners: Optional[int] = None
    fouls: Optional[int] = None
    yellow_cards: Optional[int] = None
    red_cards: Optional[int] = None
    offsides: Optional[int] = None

class MatchStatisticsResponse(BaseModel):
    id: int
    match_id: int
    club_id: int
    possession: int
    shots: int
    shots_on_target: int
    corners: int
    fouls: int
    yellow_cards: int
    red_cards: int
    offsides: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MatchStatisticsWithClubResponse(BaseModel):
    id: int
    match_id: int
    club_id: int
    club_name: str
    possession: int
    shots: int
    shots_on_target: int
    corners: int
    fouls: int
    yellow_cards: int
    red_cards: int
    offsides: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 