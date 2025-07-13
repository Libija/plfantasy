from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FantasyTeamBase(BaseModel):
    user_id: int
    name: str

class FantasyTeamCreate(FantasyTeamBase):
    pass

class FantasyTeamResponse(FantasyTeamBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 