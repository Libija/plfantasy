from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class FantasyLeague(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    code: str = Field(unique=True, index=True)  # Jedinstveni 6-karakterski kod
    creator_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.now)

