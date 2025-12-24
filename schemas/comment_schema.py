from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.comment_model import CommentStatus

class CommentCreate(BaseModel):
    news_id: int
    parent_id: Optional[int] = None
    content: str

class CommentUpdate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    news_id: int
    user_id: int
    user_username: str
    parent_id: Optional[int]
    content: str
    status: CommentStatus
    created_at: datetime
    updated_at: Optional[datetime]
    edited_at: Optional[datetime]
    is_edited: bool
    likes_count: int
    user_liked: bool
    can_edit: bool
    can_delete: bool
    replies: List['CommentResponse'] = []
    
    class Config:
        from_attributes = True

# Za rekurzivne tipove
CommentResponse.model_rebuild()

