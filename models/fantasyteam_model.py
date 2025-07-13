from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class FantasyTeam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    created_at: datetime = Field(default_factory=datetime.now)
