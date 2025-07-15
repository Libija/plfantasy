from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session
from database import get_session
from schemas.fantasy_team_schema import FantasyTeamCreate, FantasyTeamUpdate, FantasyTeamResponse
from services.fantasy_team_service import (
    create_fantasy_team_service, 
    get_fantasy_team_service,
    get_user_fantasy_teams_service,
    update_fantasy_team_service,
    delete_fantasy_team_service,
    list_fantasy_teams_service,
    get_transfers_data_service,
    save_transfers_service,
    get_team_current_gameweek_points_service
)
from typing import List

router = APIRouter(prefix="/admin/fantasy", tags=["fantasy"])

# Javni endpointi za fantasy
public_router = APIRouter(prefix="/fantasy", tags=["public-fantasy"])

@public_router.get("/teams/user/{user_id}", response_model=List[FantasyTeamResponse])
def get_user_fantasy_teams(user_id: int, session: Session = Depends(get_session)):
    """Dohvata fantasy timove za određenog korisnika"""
    return get_user_fantasy_teams_service(session, user_id)

@public_router.get("/teams/{fantasy_team_id}", response_model=FantasyTeamResponse)
def get_fantasy_team(fantasy_team_id: int, session: Session = Depends(get_session)):
    """Dohvata fantasy tim po ID-u"""
    return get_fantasy_team_service(session, fantasy_team_id)

@public_router.post("/teams", response_model=FantasyTeamResponse, status_code=status.HTTP_201_CREATED)
def create_fantasy_team(data: FantasyTeamCreate, session: Session = Depends(get_session)):
    """Kreira novi fantasy tim"""
    return create_fantasy_team_service(session, data)

@public_router.put("/teams/{fantasy_team_id}", response_model=FantasyTeamResponse)
def update_fantasy_team(fantasy_team_id: int, data: FantasyTeamUpdate, session: Session = Depends(get_session)):
    """Ažurira fantasy tim"""
    return update_fantasy_team_service(session, fantasy_team_id, data)

@public_router.delete("/teams/{fantasy_team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fantasy_team(fantasy_team_id: int, session: Session = Depends(get_session)):
    """Briše fantasy tim"""
    delete_fantasy_team_service(session, fantasy_team_id)
    return None

# Transfer endpoints
@public_router.get("/transfers/{user_id}")
def get_transfers_data(user_id: int, session: Session = Depends(get_session)):
    """Dohvata podatke za transfers stranicu - tim, igrače, transfer window status, itd."""
    return get_transfers_data_service(session, user_id)

@public_router.post("/transfers/{user_id}")
def save_transfers(user_id: int, transfer_data: dict, session: Session = Depends(get_session)):
    """Sprema draft ili transfere za korisnika"""
    return save_transfers_service(session, user_id, transfer_data)

@public_router.get("/team/{fantasy_team_id}/gameweek/current")
def get_team_current_gameweek_points(fantasy_team_id: int, session: Session = Depends(get_session)):
    """Dohvata fantasy poene za tim u trenutnom kolu (IN_PROGRESS)"""
    return get_team_current_gameweek_points_service(session, fantasy_team_id)

# Admin endpointi
@router.get("/teams", response_model=List[FantasyTeamResponse])
def list_fantasy_teams(session: Session = Depends(get_session)):
    """Dohvata sve fantasy timove (admin)"""
    return list_fantasy_teams_service(session) 