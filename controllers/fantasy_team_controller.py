from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session
from database import get_session
from schemas.fantasy_team_schema import FantasyTeamCreate, FantasyTeamResponse
from services.fantasy_team_service import create_fantasy_team_service, get_user_fantasy_teams_service
from typing import List

router = APIRouter(prefix="/admin/fantasy", tags=["fantasy"])

# Javni endpointi za fantasy
public_router = APIRouter(prefix="/fantasy", tags=["public-fantasy"])

@public_router.get("/teams/user/{user_id}", response_model=List[FantasyTeamResponse])
def get_user_fantasy_teams(user_id: int, session: Session = Depends(get_session)):
    """Dohvata fantasy timove za određenog korisnika"""
    return get_user_fantasy_teams_service(session, user_id)

@router.post("/teams", response_model=FantasyTeamResponse, status_code=status.HTTP_201_CREATED)
def create_fantasy_team(data: FantasyTeamCreate, session: Session = Depends(get_session)):
    """Kreira novi fantasy tim"""
    return create_fantasy_team_service(session, data) 