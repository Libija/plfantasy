from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from database import get_session
from typing import Optional
from schemas.fantasy_league_schema import (
    FantasyLeagueCreate,
    FantasyLeagueResponse,
    FantasyLeagueJoinRequest,
    FantasyLeagueRankingResponse
)
from services.fantasy_league_service import (
    create_fantasy_league_service,
    join_fantasy_league_service,
    get_fantasy_league_service,
    get_user_leagues_service,
    get_league_ranking_service,
    leave_fantasy_league_service
)
from typing import List

router = APIRouter(prefix="/fantasy/leagues", tags=["fantasy-leagues"])

@router.post("", response_model=FantasyLeagueResponse, status_code=201)
def create_league(
    data: FantasyLeagueCreate,
    session: Session = Depends(get_session)
):
    """Kreira novu fantasy ligu"""
    try:
        return create_fantasy_league_service(session, data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri kreiranju lige: {str(e)}")

@router.post("/join", response_model=FantasyLeagueResponse)
def join_league(
    data: FantasyLeagueJoinRequest,
    user_id: int = Query(..., description="ID korisnika"),
    session: Session = Depends(get_session)
):
    """Pridružuje korisnika ligi preko koda"""
    try:
        return join_fantasy_league_service(session, user_id, data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri pridruživanju ligi: {str(e)}")

@router.get("/my-leagues", response_model=List[FantasyLeagueResponse])
def get_my_leagues(
    user_id: int = Query(..., description="ID korisnika"),
    session: Session = Depends(get_session)
):
    """Dohvata sve lige u kojima je korisnik član"""
    try:
        return get_user_leagues_service(session, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvatu liga: {str(e)}")

@router.get("/{league_id}", response_model=FantasyLeagueResponse)
def get_league(
    league_id: int,
    session: Session = Depends(get_session)
):
    """Dohvata detalje lige"""
    try:
        return get_fantasy_league_service(session, league_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvatu lige: {str(e)}")

@router.get("/{league_id}/ranking", response_model=FantasyLeagueRankingResponse)
def get_league_ranking(
    league_id: int,
    user_id: Optional[int] = Query(None, description="ID korisnika (opcionalno)"),
    session: Session = Depends(get_session)
):
    """Dohvata ranking lige"""
    try:
        return get_league_ranking_service(session, league_id, user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvatu rankinga: {str(e)}")

@router.delete("/{league_id}/leave")
def leave_league(
    league_id: int,
    user_id: int = Query(..., description="ID korisnika"),
    session: Session = Depends(get_session)
):
    """Uklanja korisnika iz lige"""
    try:
        return leave_fantasy_league_service(session, league_id, user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri napuštanju lige: {str(e)}")

