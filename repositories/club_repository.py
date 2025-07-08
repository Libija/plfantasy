from sqlmodel import Session, select
from models.club_model import Club
from typing import List, Optional

def create_club(session: Session, club: Club) -> Club:
    session.add(club)
    session.commit()
    session.refresh(club)
    return club

def get_all_clubs(session: Session) -> List[Club]:
    return session.exec(select(Club)).all()

def get_club_by_id(session: Session, club_id: int) -> Optional[Club]:
    return session.get(Club, club_id)

def update_club(session: Session, club: Club) -> Club:
    session.add(club)
    session.commit()
    session.refresh(club)
    return club

def delete_club(session: Session, club: Club):
    session.delete(club)
    session.commit() 