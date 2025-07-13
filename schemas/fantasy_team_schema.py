from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FantasyTeamBase(BaseModel):
    user_id: int
    name: str = Field(..., min_length=1, max_length=50, description="Naziv fantasy tima")
    favorite_club_id: Optional[int] = Field(None, description="ID omiljenog kluba")

class FantasyTeamCreate(FantasyTeamBase):
    pass

class FantasyTeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    favorite_club_id: Optional[int] = None

class FantasyTeamResponse(FantasyTeamBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 