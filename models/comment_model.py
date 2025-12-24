from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class CommentStatus(str, Enum):
    approved = "approved"
    deleted = "deleted"  # Soft delete - prikazuje se "Korisnik je uklonio komentar"

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Veze
    news_id: int = Field(foreign_key="news.id")
    user_id: int = Field(foreign_key="user.id")
    parent_id: Optional[int] = Field(default=None, foreign_key="comment.id")  # NULL = glavni komentar
    
    # Sadržaj
    content: str
    status: CommentStatus = Field(default=CommentStatus.approved)
    
    # Metapodaci
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    edited_at: Optional[datetime] = None
    is_edited: bool = Field(default=False)
    
    # Statistika
    likes_count: int = Field(default=0)

