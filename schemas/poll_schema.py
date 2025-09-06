from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.poll_model import PollType

# Base schemas
class PollOptionBase(BaseModel):
    option_text: str = Field(..., max_length=200)
    option_value: Optional[str] = Field(None)
    order: int = Field(default=0)

class PollOptionCreate(PollOptionBase):
    pass

class PollOptionResponse(PollOptionBase):
    id: int
    poll_id: int
    created_at: datetime
    vote_count: Optional[int] = Field(default=0)  # Broj glasova za ovu opciju

    class Config:
        from_attributes = True

class PollBase(BaseModel):
    question: str = Field(..., max_length=500)
    poll_type: PollType = Field(default=PollType.CHOICE)
    is_active: bool = Field(default=True)

class PollCreate(PollBase):
    news_id: Optional[int] = Field(None)
    options: List[PollOptionCreate] = Field(default=[], description="Lista opcija ankete")

class PollUpdate(BaseModel):
    question: Optional[str] = Field(None, max_length=500)
    poll_type: Optional[PollType] = None
    is_active: Optional[bool] = None

class PollResponse(PollBase):
    id: int
    news_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    options: List[PollOptionResponse] = Field(default=[])
    total_votes: Optional[int] = Field(default=0)  # Ukupan broj glasova
    user_voted: Optional[bool] = Field(default=False)  # Da li je trenutni korisnik glasao
    all_polls_voted: Optional[bool] = Field(default=False)  # Da li je korisnik glasao na svim anketama

    class Config:
        from_attributes = True

# Vote schemas
class PollVoteCreate(BaseModel):
    option_id: int

class PollVoteResponse(BaseModel):
    id: int
    poll_id: int
    user_id: int
    option_id: int
    voted_at: datetime

    class Config:
        from_attributes = True

# Special schemas for different poll types
class RatingPollCreate(BaseModel):
    question: str = Field(..., max_length=500)
    news_id: Optional[int] = Field(None)
    # Automatski kreira opcije 1-5

class ChoicePollCreate(BaseModel):
    question: str = Field(..., max_length=500)
    news_id: Optional[int] = Field(None)
    options: List[str] = Field(..., min_items=2, max_items=10)  # Lista opcija za izbor
