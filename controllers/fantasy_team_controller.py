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
    list_fantasy_teams_service
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

# Admin endpointi
@router.get("/teams", response_model=List[FantasyTeamResponse])
def list_fantasy_teams(session: Session = Depends(get_session)):
    """Dohvata sve fantasy timove (admin)"""
    return list_fantasy_teams_service(session) 