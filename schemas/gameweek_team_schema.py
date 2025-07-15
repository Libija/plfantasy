from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GameweekPlayerResponse(BaseModel):
    id: int
    gameweek_team_id: int
    player_id: int
    position: str
    is_bench: bool
    points: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class GameweekTeamBase(BaseModel):
    user_id: int
    gameweek_id: int
    formation: str
    captain_id: int
    vice_captain_id: int
    total_points: float

class GameweekTeamCreate(GameweekTeamBase):
    pass

class GameweekTeamResponse(GameweekTeamBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GameweekTeamWithPlayers(GameweekTeamResponse):
    players: List[GameweekPlayerResponse] = []

class GameweekTeamList(BaseModel):
    gameweek_teams: List[GameweekTeamResponse]
    total: int 