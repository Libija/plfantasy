from sqlmodel import Session, select
from models.gameweek_team_model import GameweekTeam
from models.gameweek_player_model import GameweekPlayer
from models.player_model import Player
from models.gameweek_model import Gameweek
from typing import List, Optional
from datetime import datetime

def create_gameweek_team(session: Session, gameweek_team: GameweekTeam, commit=True) -> GameweekTeam:
    """Kreira novi gameweek tim"""
    session.add(gameweek_team)
    if commit:
        session.commit()
        session.refresh(gameweek_team)
    return gameweek_team

def get_gameweek_team_by_id(session: Session, team_id: int) -> Optional[GameweekTeam]:
    """Dohvata gameweek tim po ID-u"""
    statement = select(GameweekTeam).where(GameweekTeam.id == team_id)
    return session.exec(statement).first()

def get_user_gameweek_teams(session: Session, user_id: int) -> List[GameweekTeam]:
    """Dohvata sve gameweek timove za korisnika"""
    statement = select(GameweekTeam).where(GameweekTeam.user_id == user_id)
    return list(session.exec(statement).all())

def get_user_gameweek_team(session: Session, user_id: int, gameweek_id: int) -> Optional[GameweekTeam]:
    """Dohvata gameweek tim za korisnika i kolo"""
    statement = select(GameweekTeam).where(
        GameweekTeam.user_id == user_id,
        GameweekTeam.gameweek_id == gameweek_id
    )
    return session.exec(statement).first()

def get_completed_gameweek_teams(session: Session, user_id: int) -> List[GameweekTeam]:
    """Dohvata gameweek timove iz završenih kola"""
    statement = select(GameweekTeam).join(Gameweek).where(
        GameweekTeam.user_id == user_id,
        Gameweek.status == "COMPLETED"
    )
    return list(session.exec(statement).all())

def create_gameweek_player(session: Session, gameweek_player: GameweekPlayer, commit=True) -> GameweekPlayer:
    """Kreira novog gameweek igrača"""
    session.add(gameweek_player)
    if commit:
        session.commit()
        session.refresh(gameweek_player)
    return gameweek_player

def get_gameweek_team_players(session: Session, gameweek_team_id: int) -> List[GameweekPlayer]:
    """Dohvata sve igrače gameweek tima"""
    statement = select(GameweekPlayer).where(GameweekPlayer.gameweek_team_id == gameweek_team_id)
    return list(session.exec(statement).all())

def get_gameweek_team_with_players(session: Session, team_id: int) -> Optional[GameweekTeam]:
    """Dohvata gameweek tim sa igračima"""
    statement = select(GameweekTeam).where(GameweekTeam.id == team_id)
    team = session.exec(statement).first()
    if team:
        # Load players
        players_statement = select(GameweekPlayer).where(GameweekPlayer.gameweek_team_id == team_id)
        team.players = list(session.exec(players_statement).all())
    return team 