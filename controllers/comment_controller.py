from fastapi import APIRouter, Depends, status, HTTPException, Header
from sqlmodel import Session
from database import get_session
from schemas.comment_schema import CommentCreate, CommentUpdate, CommentResponse
from services.comment_service import (
    create_comment_service, update_comment_service, delete_comment_service,
    get_comments_service, toggle_like_service, get_all_comments_service
)
from services.jwt_service import verify_access_token
from typing import List, Optional

router = APIRouter(prefix="/comments", tags=["comments"])
admin_router = APIRouter(prefix="/admin/comments", tags=["admin-comments"])

def get_current_user_id(authorization: Optional[str] = Header(None)):
    """Dohvata user_id iz JWT tokena"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header je potreban")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Nevaljan format tokena")
    
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Nevaljan token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token ne sadrži user_id")
    
    return int(user_id)

def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """Dohvata user_id iz JWT tokena (opcionalno)"""
    if not authorization:
        return None
    
    if not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    
    if payload is None:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    return int(user_id)

# Public endpoints
@router.get("/news/{news_id}", response_model=List[CommentResponse])
def get_comments(
    news_id: int,
    session: Session = Depends(get_session),
    authorization: Optional[str] = Header(None)
):
    user_id = get_optional_user_id(authorization)
    return get_comments_service(session, news_id, user_id)

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    data: CommentCreate,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    return create_comment_service(session, data, user_id)

@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    data: CommentUpdate,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    return update_comment_service(session, comment_id, data, user_id)

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    return delete_comment_service(session, comment_id, user_id, hard_delete=False)

@router.post("/{comment_id}/like")
def toggle_like(
    comment_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    return toggle_like_service(session, comment_id, user_id)

# Admin endpoints
@admin_router.get("/news/{news_id}", response_model=List[CommentResponse])
def get_all_comments(
    news_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    # Provjeri da li je admin
    from models.user_model import User
    user = session.get(User, user_id)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Samo admin može pristupiti")
    
    return get_all_comments_service(session, news_id)

@admin_router.delete("/{comment_id}")
def admin_delete_comment(
    comment_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    # Provjeri da li je admin
    from models.user_model import User
    user = session.get(User, user_id)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Samo admin može obrisati")
    
    return delete_comment_service(session, comment_id, user_id, hard_delete=True)

