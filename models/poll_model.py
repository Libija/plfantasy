from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PollType(str, Enum):
    RATING = "rating"  # 1-5 ocjena
    CHOICE = "choice"  # izbor između opcija
    MULTIPLE_CHOICE = "multiple_choice"  # više izbora

class Poll(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    news_id: Optional[int] = Field(default=None, foreign_key="news.id")  # Može biti vezan za vijest
    question: str = Field(..., max_length=500, description="Pitanje ankete")
    poll_type: PollType = Field(default=PollType.CHOICE, description="Tip ankete")
    is_active: bool = Field(default=True, description="Da li je anketa aktivna")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default=None)

class PollOption(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    poll_id: int = Field(foreign_key="poll.id")
    option_text: str = Field(..., max_length=200, description="Tekst opcije")
    option_value: Optional[str] = Field(default=None, description="Vrijednost opcije (za 1-5 ocjene)")
    order: int = Field(default=0, description="Redoslijed prikaza")
    created_at: datetime = Field(default_factory=datetime.now)

class PollVote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    poll_id: int = Field(foreign_key="poll.id")
    user_id: int = Field(foreign_key="user.id")
    option_id: int = Field(foreign_key="polloption.id")
    voted_at: datetime = Field(default_factory=datetime.now)
    
    # Unique constraint - jedan korisnik može glasati samo jednom po anketi
    __table_args__ = (
        {"extend_existing": True}
    )
