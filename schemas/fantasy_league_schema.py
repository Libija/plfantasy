from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FantasyLeagueCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Naziv lige")
    creator_id: int = Field(..., description="ID korisnika koji kreira ligu")

class FantasyLeagueJoinRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, description="Kod lige (6 karaktera)")

class FantasyLeagueResponse(BaseModel):
    id: int
    name: str
    code: str
    creator_id: int
    creator_username: Optional[str] = None
    created_at: datetime
    member_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class FantasyLeagueRankingEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    team_name: Optional[str] = None
    total_points: float
    last_week_points: Optional[float] = 0
    is_me: bool = False

class FantasyLeagueRankingResponse(BaseModel):
    league_id: int
    league_name: str
    league_code: str
    ranking: List[FantasyLeagueRankingEntry]
    total_members: int

