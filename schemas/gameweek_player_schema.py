from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GameweekPlayerBase(BaseModel):
    gameweek_team_id: int
    player_id: int
    position: str
    is_bench: bool
    points: float

class GameweekPlayerCreate(GameweekPlayerBase):
    pass

class GameweekPlayerResponse(GameweekPlayerBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GameweekPlayerWithPlayer(GameweekPlayerResponse):
    player_name: Optional[str] = None
    player_club: Optional[str] = None
    player_price: Optional[float] = None 