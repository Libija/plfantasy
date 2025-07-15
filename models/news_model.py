from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime
from sqlalchemy import Column, Enum as PgEnum

class NewsCategory(str, Enum):
    transfer = "transfer"
    injury = "injury"
    preview = "preview"
    result = "result"
    general = "general"

class News(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    image_url: Optional[str]
    category: NewsCategory = Field(sa_column=Column(PgEnum(NewsCategory, name="newscategory_enum"), name="category"))
    club_id: Optional[int] = Field(default=None, foreign_key="club.id")
    date_posted: datetime
