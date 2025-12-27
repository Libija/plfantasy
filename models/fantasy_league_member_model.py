from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from sqlalchemy import UniqueConstraint

class FantasyLeagueMember(SQLModel, table=True):
    __tablename__ = "fantasyleaguemember"
    __table_args__ = (
        UniqueConstraint("league_id", "user_id", name="unique_league_user"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    league_id: int = Field(foreign_key="fantasyleague.id")
    user_id: int = Field(foreign_key="user.id")
    joined_at: datetime = Field(default_factory=datetime.now)

