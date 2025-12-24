from sqlmodel import Session
from models.comment_model import Comment, CommentStatus
from models.user_model import User
from models.news_model import News
from schemas.comment_schema import CommentCreate, CommentUpdate, CommentResponse
from repositories.comment_repository import (
    create_comment, get_comment_by_id, get_comments_by_news,
    get_replies_by_comment, update_comment, delete_comment,
    hard_delete_comment, get_all_comments_by_news
)
from repositories.comment_like_repository import get_like, create_like, delete_like, count_likes
from models.comment_like_model import CommentLike
from services.comment_moderation_service import moderate_comment
from fastapi import HTTPException
from typing import List, Optional
from datetime import datetime, timedelta

def create_comment_service(session: Session, data: CommentCreate, user_id: int) -> CommentResponse:
    # Validacija
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Komentar ne može biti prazan")
    
    # Provjeri moderaciju
    moderation_result = moderate_comment(data.content)
    if not moderation_result["approved"]:
        raise HTTPException(status_code=400, detail=moderation_result["reason"])
    
    # Provjeri da li vijest postoji
    news = session.get(News, data.news_id)
    if not news:
        raise HTTPException(status_code=404, detail="Vijest ne postoji")
    
    # Ako je reply, provjeri da li parent postoji
    if data.parent_id:
        parent = session.get(Comment, data.parent_id)
        if not parent or parent.news_id != data.news_id:
            raise HTTPException(status_code=400, detail="Nevaljan parent komentar")
        if parent.status == CommentStatus.deleted:
            raise HTTPException(status_code=400, detail="Ne možete reply-ovati na obrisan komentar")
    
    # Kreiraj komentar (automatski odobren)
    comment = Comment(
        news_id=data.news_id,
        user_id=user_id,
        parent_id=data.parent_id,
        content=data.content.strip(),
        status=CommentStatus.approved  # Automatski odobren
    )
    
    comment = create_comment(session, comment)
    return format_comment_response(session, comment, user_id)

def update_comment_service(session: Session, comment_id: int, data: CommentUpdate, user_id: int) -> CommentResponse:
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Komentar ne postoji")
    
    # Provjeri permisije
    user = session.get(User, user_id)
    if comment.user_id != user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Možete editovati samo svoje komentare")
    
    # Provjeri vrijeme (15 minuta)
    time_limit = timedelta(minutes=15)
    if datetime.utcnow() - comment.created_at > time_limit and user.role != "admin":
        raise HTTPException(status_code=400, detail="Vrijeme za editovanje je isteklo")
    
    # Provjeri moderaciju
    moderation_result = moderate_comment(data.content)
    if not moderation_result["approved"]:
        raise HTTPException(status_code=400, detail=moderation_result["reason"])
    
    # Provjeri status
    if comment.status != CommentStatus.approved:
        raise HTTPException(status_code=400, detail="Možete editovati samo odobrene komentare")
    
    # Ažuriraj
    comment.content = data.content.strip()
    comment.is_edited = True
    comment.edited_at = datetime.utcnow()
    comment.updated_at = datetime.utcnow()
    
    comment = update_comment(session, comment)
    return format_comment_response(session, comment, user_id)

def delete_comment_service(session: Session, comment_id: int, user_id: int, hard_delete: bool = False) -> dict:
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Komentar ne postoji")
    
    # Provjeri permisije
    user = session.get(User, user_id)
    if comment.user_id != user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Možete obrisati samo svoje komentare")
    
    if hard_delete:
        # Hard delete - potpuno briše
        if comment.parent_id is None:
            # Ako je glavni komentar, obriši sve reply-jeve (uključujući deleted)
            replies = get_replies_by_comment(session, comment_id, include_deleted=True)
            for reply in replies:
                hard_delete_comment(session, reply.id)
        hard_delete_comment(session, comment_id)
    else:
        # Soft delete
        if comment.parent_id is None:
            # Ako je glavni komentar, obriši sve reply-jeve (soft delete) - samo approved
            replies = get_replies_by_comment(session, comment_id, include_deleted=False)
            for reply in replies:
                reply.status = CommentStatus.deleted
                reply.updated_at = datetime.utcnow()
                update_comment(session, reply)
        comment.status = CommentStatus.deleted
        comment.updated_at = datetime.utcnow()
        update_comment(session, comment)
    
    return {"message": "Komentar obrisan"}

def get_comments_service(session: Session, news_id: int, user_id: Optional[int] = None) -> List[CommentResponse]:
    """Dohvata sve odobrene komentare za vijest sa reply-jevim"""
    main_comments = get_comments_by_news(session, news_id, user_id)
    result = []
    
    for comment in main_comments:
        comment_response = format_comment_response(session, comment, user_id)
        # Dohvati reply-jeve
        replies = get_replies_by_comment(session, comment.id)
        comment_response.replies = [format_comment_response(session, reply, user_id) for reply in replies]
        result.append(comment_response)
    
    return result

def format_comment_response(session: Session, comment: Comment, user_id: Optional[int] = None) -> CommentResponse:
    """Formatira komentar u response format"""
    user = session.get(User, comment.user_id)
    username = user.username if user else "Nepoznat korisnik"
    
    # Provjeri da li je korisnik lajkovao
    user_liked = False
    if user_id:
        like = get_like(session, comment.id, user_id)
        user_liked = like is not None
    
    # Provjeri permisije
    can_edit = False
    can_delete = False
    if user_id:
        if comment.user_id == user_id:
            # Provjeri vrijeme za edit (15 min)
            time_limit = timedelta(minutes=15)
            can_edit = (datetime.utcnow() - comment.created_at <= time_limit) or comment.status == CommentStatus.approved
            can_delete = True
        else:
            # Provjeri da li je admin
            user = session.get(User, user_id)
            if user and user.role == "admin":
                can_edit = True
                can_delete = True
    
    return CommentResponse(
        id=comment.id,
        news_id=comment.news_id,
        user_id=comment.user_id,
        user_username=username,
        parent_id=comment.parent_id,
        content=comment.content,
        status=comment.status,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        edited_at=comment.edited_at,
        is_edited=comment.is_edited,
        likes_count=comment.likes_count,
        user_liked=user_liked,
        can_edit=can_edit,
        can_delete=can_delete,
        replies=[]
    )

def toggle_like_service(session: Session, comment_id: int, user_id: int) -> dict:
    """Toggle like na komentar"""
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Komentar ne postoji")
    
    if comment.status != CommentStatus.approved:
        raise HTTPException(status_code=400, detail="Ne možete lajkovati obrisan komentar")
    
    existing_like = get_like(session, comment_id, user_id)
    
    if existing_like:
        # Ukloni like
        delete_like(session, existing_like)
        comment.likes_count = max(0, comment.likes_count - 1)
        action = "unliked"
    else:
        # Dodaj like
        like = CommentLike(comment_id=comment_id, user_id=user_id)
        create_like(session, like)
        comment.likes_count += 1
        action = "liked"
    
    update_comment(session, comment)
    return {"action": action, "likes_count": comment.likes_count}

def get_all_comments_service(session: Session, news_id: int) -> List[CommentResponse]:
    """Dohvata SVE komentare za vijest (za admin panel)"""
    comments = get_all_comments_by_news(session, news_id)
    # Filtriraj samo glavne komentare
    main_comments = [c for c in comments if c.parent_id is None]
    result = []
    
    for comment in main_comments:
        comment_response = format_comment_response(session, comment, None)
        # Dohvati reply-jeve (uključujući deleted)
        replies = get_replies_by_comment(session, comment.id, include_deleted=True)
        comment_response.replies = [format_comment_response(session, reply, None) for reply in replies]
        result.append(comment_response)
    
    return result

