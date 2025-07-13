from sqlmodel import Session
from models.fantasyteam_model import FantasyTeam
from repositories.fantasy_team_repository import (
    create_fantasy_team, 
    get_fantasy_team_by_id, 
    get_fantasy_teams_by_user_id,
    get_fantasy_team_by_user_and_name,
    update_fantasy_team,
    delete_fantasy_team,
    get_all_fantasy_teams
)
from schemas.fantasy_team_schema import FantasyTeamCreate, FantasyTeamUpdate, FantasyTeamResponse
from fastapi import HTTPException
from typing import List

def create_fantasy_team_service(session: Session, data: FantasyTeamCreate) -> FantasyTeamResponse:
    """Kreira novi fantasy tim"""
    # Provjeri da li korisnik već ima tim sa istim nazivom
    existing_team = get_fantasy_team_by_user_and_name(session, data.user_id, data.name)
    if existing_team:
        raise HTTPException(
            status_code=400, 
            detail=f"Već imate tim sa nazivom '{data.name}'"
        )
    
    fantasy_team = FantasyTeam(
        user_id=data.user_id,
        name=data.name,
        favorite_club_id=data.favorite_club_id
    )
    
    fantasy_team = create_fantasy_team(session, fantasy_team)
    return FantasyTeamResponse.from_orm(fantasy_team)

def get_fantasy_team_service(session: Session, fantasy_team_id: int) -> FantasyTeamResponse:
    """Dohvata fantasy tim po ID-u"""
    fantasy_team = get_fantasy_team_by_id(session, fantasy_team_id)
    if not fantasy_team:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    return FantasyTeamResponse.from_orm(fantasy_team)

def get_user_fantasy_teams_service(session: Session, user_id: int) -> List[FantasyTeamResponse]:
    """Dohvata fantasy timove za određenog korisnika"""
    fantasy_teams = get_fantasy_teams_by_user_id(session, user_id)
    return [FantasyTeamResponse.from_orm(team) for team in fantasy_teams]

def update_fantasy_team_service(session: Session, fantasy_team_id: int, data: FantasyTeamUpdate) -> FantasyTeamResponse:
    """Ažurira fantasy tim"""
    fantasy_team = get_fantasy_team_by_id(session, fantasy_team_id)
    if not fantasy_team:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    
    # Provjeri da li korisnik već ima tim sa istim nazivom (ako se mijenja naziv)
    if data.name and data.name != fantasy_team.name:
        existing_team = get_fantasy_team_by_user_and_name(session, fantasy_team.user_id, data.name)
        if existing_team:
            raise HTTPException(
                status_code=400, 
                detail=f"Već imate tim sa nazivom '{data.name}'"
            )
    
    # Ažuriraj polja
    if data.name is not None:
        fantasy_team.name = data.name
    if data.favorite_club_id is not None:
        fantasy_team.favorite_club_id = data.favorite_club_id
    
    fantasy_team = update_fantasy_team(session, fantasy_team)
    return FantasyTeamResponse.from_orm(fantasy_team)

def delete_fantasy_team_service(session: Session, fantasy_team_id: int) -> bool:
    """Briše fantasy tim"""
    success = delete_fantasy_team(session, fantasy_team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    return True

def list_fantasy_teams_service(session: Session) -> List[FantasyTeamResponse]:
    """Dohvata sve fantasy timove"""
    fantasy_teams = get_all_fantasy_teams(session)
    return [FantasyTeamResponse.from_orm(team) for team in fantasy_teams] 