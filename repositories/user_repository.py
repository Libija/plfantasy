from sqlmodel import Session, select
from models.user_model import User
from typing import Optional

def get_user_by_username(session: Session, username: str) -> Optional[User]:
    statement = select(User).where(User.username == username)
    result = session.exec(statement).first()
    return result

def get_user_by_email(session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    result = session.exec(statement).first()
    return result

def create_user(session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
