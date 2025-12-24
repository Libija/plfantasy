from sqlmodel import Session, select
from models.comment_like_model import CommentLike
from typing import Optional

def get_like(session: Session, comment_id: int, user_id: int) -> Optional[CommentLike]:
    """Dohvata like ako postoji"""
    statement = select(CommentLike).where(
        CommentLike.comment_id == comment_id,
        CommentLike.user_id == user_id
    )
    return session.exec(statement).first()

def create_like(session: Session, like: CommentLike) -> CommentLike:
    session.add(like)
    session.commit()
    session.refresh(like)
    return like

def delete_like(session: Session, like: CommentLike) -> bool:
    session.delete(like)
    session.commit()
    return True

def count_likes(session: Session, comment_id: int) -> int:
    """Broji lajkove za komentar"""
    statement = select(CommentLike).where(CommentLike.comment_id == comment_id)
    return len(list(session.exec(statement).all()))

