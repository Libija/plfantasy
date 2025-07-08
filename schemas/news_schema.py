from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.news_model import NewsCategory

class NewsCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    category: NewsCategory
    club_id: Optional[int] = None
    date_posted: datetime

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[NewsCategory] = None
    club_id: Optional[int] = None
    date_posted: Optional[datetime] = None

class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str]
    category: NewsCategory
    club_id: Optional[int]
    date_posted: datetime

    class Config:
        from_attributes = True 