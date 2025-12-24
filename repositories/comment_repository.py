from sqlmodel import Session, select
from models.comment_model import Comment, CommentStatus
from typing import List, Optional
from datetime import datetime

def create_comment(session: Session, comment: Comment) -> Comment:
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment

def get_comment_by_id(session: Session, comment_id: int) -> Optional[Comment]:
    return session.get(Comment, comment_id)

def get_comments_by_news(session: Session, news_id: int, user_id: Optional[int] = None) -> List[Comment]:
    """Dohvata sve odobrene glavne komentare za vijest, sortirane po likes_count desc"""
    statement = select(Comment).where(
        Comment.news_id == news_id,
        Comment.parent_id.is_(None),
        Comment.status == CommentStatus.approved
    ).order_by(Comment.likes_count.desc(), Comment.created_at.desc())
    return list(session.exec(statement).all())

def get_replies_by_comment(session: Session, comment_id: int, include_deleted: bool = False) -> List[Comment]:
    """Dohvata reply-jeve za komentar"""
    if include_deleted:
        statement = select(Comment).where(
            Comment.parent_id == comment_id
        ).order_by(Comment.created_at.asc())
    else:
        statement = select(Comment).where(
            Comment.parent_id == comment_id,
            Comment.status == CommentStatus.approved
        ).order_by(Comment.created_at.asc())
    return list(session.exec(statement).all())

def update_comment(session: Session, comment: Comment) -> Comment:
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment

def delete_comment(session: Session, comment_id: int) -> bool:
    """Soft delete - postavlja status na deleted"""
    comment = session.get(Comment, comment_id)
    if not comment:
        return False
    comment.status = CommentStatus.deleted
    comment.updated_at = datetime.utcnow()
    session.add(comment)
    session.commit()
    return True

def hard_delete_comment(session: Session, comment_id: int) -> bool:
    """Hard delete - potpuno briše komentar iz baze"""
    comment = session.get(Comment, comment_id)
    if not comment:
        return False
    session.delete(comment)
    session.commit()
    return True

def get_all_comments_by_news(session: Session, news_id: int) -> List[Comment]:
    """Dohvata SVE komentare za vijest (za admin panel)"""
    statement = select(Comment).where(
        Comment.news_id == news_id
    ).order_by(Comment.created_at.desc())
    return list(session.exec(statement).all())

