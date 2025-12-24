from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from services.gameweek_team_service import GameweekTeamService
from services.gameweek_service import GameweekService
from schemas.gameweek_team_schema import GameweekTeamResponse, GameweekTeamList
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/admin/gameweek-teams", tags=["Gameweek Teams"])

# Javni endpointi
public_router = APIRouter(prefix="/gameweek-teams", tags=["public-gameweek-teams"])

@public_router.post("/snapshot/{user_id}/{gameweek_id}", response_model=GameweekTeamResponse)
def create_team_snapshot(
    user_id: int,
    gameweek_id: int,
    session: Session = Depends(get_session)
):
    """Kreira snapshot tima za određeno kolo"""
    service = GameweekTeamService(session)
    snapshot = service.create_team_snapshot(user_id, gameweek_id)
    
    if not snapshot:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    
    return GameweekTeamResponse.from_orm(snapshot)

@public_router.get("/results/{user_id}", response_model=List[Dict[str, Any]])
def get_user_results(
    user_id: int,
    session: Session = Depends(get_session)
):
    """Dohvata rezultate korisnika iz svih završenih kola"""
    service = GameweekTeamService(session)
    results = service.get_user_results(user_id)
    return results

@public_router.get("/results/{user_id}/{gameweek_id}", response_model=Dict[str, Any])
def get_gameweek_result(
    user_id: int,
    gameweek_id: int,
    session: Session = Depends(get_session)
):
    """Dohvata rezultat za određeno kolo"""
    service = GameweekTeamService(session)
    result = service.get_gameweek_result(user_id, gameweek_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Rezultat za ovo kolo nije pronađen")
    
    return result

@public_router.post("/auto-snapshot/{gameweek_id}")
def create_auto_snapshots(
    gameweek_id: int,
    session: Session = Depends(get_session)
):
    """Automatski kreira snapshote za sve korisnike kada se kolo završi"""
    service = GameweekTeamService(session)
    result = service.create_snapshots_for_completed_gameweek(gameweek_id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

@public_router.get("/best-team/last-gameweek", response_model=Dict[str, Any])
def get_best_team_last_gameweek(
    session: Session = Depends(get_session)
):
    """Dohvata najbolji tim (najviše poena) iz zadnjeg završenog kola"""
    gameweek_service = GameweekService(session)
    last_completed_gameweek = gameweek_service.get_last_completed_gameweek()
    
    if not last_completed_gameweek:
        raise HTTPException(status_code=404, detail="Nema završenih kola")
    
    team_service = GameweekTeamService(session)
    best_team = team_service.get_best_team_for_gameweek(last_completed_gameweek.id)
    
    if not best_team:
        raise HTTPException(status_code=404, detail="Nema timova za ovo kolo")
    
    return best_team 