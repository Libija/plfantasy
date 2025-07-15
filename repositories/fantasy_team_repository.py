from sqlmodel import Session, select
from models.fantasyteam_model import FantasyTeam
from models.fantasyteamplayer import FantasyTeamPlayer
from models.player_model import Player
from typing import List, Optional, Dict, Any

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
    return list(session.exec(statement).all())

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
    return list(session.exec(statement).all())

# Nove metode za transfer operacije

def get_fantasy_team_players(session: Session, fantasy_team_id: int) -> List[Dict[str, Any]]:
    """Dohvata sve igrače fantasy tima sa detaljima"""
    statement = select(FantasyTeamPlayer, Player).join(Player).where(
        FantasyTeamPlayer.fantasy_team_id == fantasy_team_id
    )
    results = session.exec(statement).all()
    
    players = []
    for ftp, player in results:
        players.append({
            "id": ftp.id,
            "player_id": player.id,
            "player_name": player.name,
            "position": player.position,
            "price": player.price,
            "club_id": player.club_id,
            "role": ftp.role,
            "formation_position": ftp.formation_position,
            "squad_number": ftp.squad_number,
            "is_captain": ftp.is_captain,
            "is_vice_captain": ftp.is_vice_captain
        })
    
    return players

def add_player_to_team(session: Session, fantasy_team_id: int, player_id: int, 
                      formation_position: str, squad_number: int, 
                      is_captain: bool = False, is_vice_captain: bool = False) -> FantasyTeamPlayer:
    """Dodaje igrača u fantasy tim"""
    fantasy_team_player = FantasyTeamPlayer(
        fantasy_team_id=fantasy_team_id,
        player_id=player_id,
        formation_position=formation_position,
        squad_number=squad_number,
        is_captain=is_captain,
        is_vice_captain=is_vice_captain
    )
    session.add(fantasy_team_player)
    session.commit()
    session.refresh(fantasy_team_player)
    return fantasy_team_player

def remove_player_from_team(session: Session, fantasy_team_player_id: int) -> bool:
    """Uklanja igrača iz fantasy tima"""
    statement = select(FantasyTeamPlayer).where(FantasyTeamPlayer.id == fantasy_team_player_id)
    fantasy_team_player = session.exec(statement).first()
    if fantasy_team_player:
        session.delete(fantasy_team_player)
        session.commit()
        return True
    return False

def update_team_formation(session: Session, fantasy_team_id: int, formation: str) -> Optional[FantasyTeam]:
    """Ažurira formaciju tima"""
    fantasy_team = get_fantasy_team_by_id(session, fantasy_team_id)
    if fantasy_team:
        fantasy_team.formation = formation
        session.add(fantasy_team)
        session.commit()
        session.refresh(fantasy_team)
    return fantasy_team

def update_team_budget(session: Session, fantasy_team_id: int, new_budget: float) -> Optional[FantasyTeam]:
    """Ažurira budžet tima"""
    fantasy_team = get_fantasy_team_by_id(session, fantasy_team_id)
    if fantasy_team:
        fantasy_team.budget = new_budget
        session.add(fantasy_team)
        session.commit()
        session.refresh(fantasy_team)
    return fantasy_team

def get_team_total_value(session: Session, fantasy_team_id: int) -> float:
    """Računa ukupnu vrijednost tima"""
    statement = select(FantasyTeamPlayer, Player).join(Player).where(
        FantasyTeamPlayer.fantasy_team_id == fantasy_team_id
    )
    results = session.exec(statement).all()
    return sum(player.price for _, player in results)

def get_team_players_count(session: Session, fantasy_team_id: int) -> int:
    """Broj igrača u timu"""
    statement = select(FantasyTeamPlayer).where(FantasyTeamPlayer.fantasy_team_id == fantasy_team_id)
    return len(session.exec(statement).all())

def check_player_in_team(session: Session, fantasy_team_id: int, player_id: int) -> bool:
    """Provjeri da li je igrač već u timu"""
    statement = select(FantasyTeamPlayer).where(
        FantasyTeamPlayer.fantasy_team_id == fantasy_team_id,
        FantasyTeamPlayer.player_id == player_id
    )
    return session.exec(statement).first() is not None 