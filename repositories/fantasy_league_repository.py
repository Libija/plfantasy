from sqlmodel import Session, select, and_
from typing import List, Optional
from models.fantasy_league_model import FantasyLeague
from models.fantasy_league_member_model import FantasyLeagueMember
from models.user_model import User

def create_fantasy_league(session: Session, league: FantasyLeague) -> FantasyLeague:
    """Kreira novu fantasy ligu"""
    session.add(league)
    session.commit()
    session.refresh(league)
    return league

def get_fantasy_league_by_id(session: Session, league_id: int) -> Optional[FantasyLeague]:
    """Dohvata ligu po ID-u"""
    return session.get(FantasyLeague, league_id)

def get_fantasy_league_by_code(session: Session, code: str) -> Optional[FantasyLeague]:
    """Dohvata ligu po kodu"""
    statement = select(FantasyLeague).where(FantasyLeague.code == code)
    return session.exec(statement).first()

def get_fantasy_leagues_by_user(session: Session, user_id: int) -> List[FantasyLeague]:
    """Dohvata sve lige u kojima je korisnik član"""
    statement = (
        select(FantasyLeague)
        .join(FantasyLeagueMember, FantasyLeagueMember.league_id == FantasyLeague.id)
        .where(FantasyLeagueMember.user_id == user_id)
    )
    return list(session.exec(statement).all())

def get_fantasy_league_members(session: Session, league_id: int) -> List[FantasyLeagueMember]:
    """Dohvata sve članove lige"""
    statement = select(FantasyLeagueMember).where(FantasyLeagueMember.league_id == league_id)
    return list(session.exec(statement).all())

def get_fantasy_league_member(session: Session, league_id: int, user_id: int) -> Optional[FantasyLeagueMember]:
    """Provjerava da li je korisnik član lige"""
    statement = select(FantasyLeagueMember).where(
        and_(
            FantasyLeagueMember.league_id == league_id,
            FantasyLeagueMember.user_id == user_id
        )
    )
    return session.exec(statement).first()

def add_league_member(session: Session, member: FantasyLeagueMember) -> FantasyLeagueMember:
    """Dodaje člana u ligu"""
    session.add(member)
    session.commit()
    session.refresh(member)
    return member

def remove_league_member(session: Session, league_id: int, user_id: int) -> bool:
    """Uklanja člana iz lige"""
    member = get_fantasy_league_member(session, league_id, user_id)
    if member:
        session.delete(member)
        session.commit()
        return True
    return False

def get_league_member_count(session: Session, league_id: int) -> int:
    """Broji članove lige"""
    statement = select(FantasyLeagueMember).where(FantasyLeagueMember.league_id == league_id)
    members = list(session.exec(statement).all())
    return len(members)

