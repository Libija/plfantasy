from sqlmodel import Session, select
from models.fantasyteam_model import FantasyTeam
from typing import List, Optional

def create_fantasy_team(session: Session, fantasy_team: FantasyTeam) -> FantasyTeam:
    """Kreira novi fantasy tim"""
    session.add(fantasy_team)
    session.commit()
    session.refresh(fantasy_team)
    return fantasy_team

def get_fantasy_team_by_id(session: Session, fantasy_team_id: int) -> Optional[FantasyTeam]:
    """Dohvata fantasy tim po ID-u"""
    statement = select(FantasyTeam).where(FantasyTeam.id == fantasy_team_id)
    return session.exec(statement).first()

def get_fantasy_teams_by_user_id(session: Session, user_id: int) -> List[FantasyTeam]:
    """Dohvata sve fantasy timove za određenog korisnika"""
    statement = select(FantasyTeam).where(FantasyTeam.user_id == user_id)
    return session.exec(statement).all()

def get_fantasy_team_by_user_and_name(session: Session, user_id: int, name: str) -> Optional[FantasyTeam]:
    """Dohvata fantasy tim po korisniku i nazivu"""
    statement = select(FantasyTeam).where(
        FantasyTeam.user_id == user_id,
        FantasyTeam.name == name
    )
    return session.exec(statement).first()

def update_fantasy_team(session: Session, fantasy_team: FantasyTeam) -> FantasyTeam:
    """Ažurira fantasy tim"""
    session.add(fantasy_team)
    session.commit()
    session.refresh(fantasy_team)
    return fantasy_team

def delete_fantasy_team(session: Session, fantasy_team_id: int) -> bool:
    """Briše fantasy tim"""
    statement = select(FantasyTeam).where(FantasyTeam.id == fantasy_team_id)
    fantasy_team = session.exec(statement).first()
    if fantasy_team:
        session.delete(fantasy_team)
        session.commit()
        return True
    return False

def get_all_fantasy_teams(session: Session) -> List[FantasyTeam]:
    """Dohvata sve fantasy timove"""
    statement = select(FantasyTeam)
    return session.exec(statement).all() 