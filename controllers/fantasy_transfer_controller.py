from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from services.transfer_service import TransferService
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter(prefix="/fantasy", tags=["Fantasy Transfers"])

class TransferRequest(BaseModel):
    player_in_id: int
    player_out_id: int
    gameweek: int
    season: str = "2024/25"

@router.post("/teams/{fantasy_team_id}/transfers", response_model=Dict[str, Any])
def make_transfer(
    fantasy_team_id: int,
    transfer_request: TransferRequest,
    session: Session = Depends(get_session)
):
    """Napravi transfer"""
    transfer_service = TransferService(session)
    
    result = transfer_service.make_transfer(
        fantasy_team_id=fantasy_team_id,
        player_in_id=transfer_request.player_in_id,
        player_out_id=transfer_request.player_out_id,
        gameweek=transfer_request.gameweek,
        season=transfer_request.season
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

@router.get("/teams/{fantasy_team_id}/transfers/history", response_model=Dict[str, Any])
def get_transfer_history(
    fantasy_team_id: int,
    session: Session = Depends(get_session)
):
    """Dohvati povijest transfera"""
    transfer_service = TransferService(session)
    
    history = transfer_service.get_transfer_history(fantasy_team_id)
    
    return {
        "success": True,
        "fantasy_team_id": fantasy_team_id,
        "transfers": history
    }

@router.get("/teams/{fantasy_team_id}/transfers/stats/{gameweek}", response_model=Dict[str, Any])
def get_transfer_stats(
    fantasy_team_id: int,
    gameweek: int,
    session: Session = Depends(get_session)
):
    """Dohvati statistike transfera za određeno kolo"""
    transfer_service = TransferService(session)
    
    stats = transfer_service.get_transfer_stats(fantasy_team_id, gameweek)
    
    return {
        "success": True,
        "fantasy_team_id": fantasy_team_id,
        "gameweek": gameweek,
        "stats": stats
    }

@router.get("/transfer-windows/status/{gameweek}", response_model=Dict[str, Any])
def check_transfer_window_status(
    gameweek: int,
    season: str = "2024/25",
    session: Session = Depends(get_session)
):
    """Provjeri da li je transfer window otvoren"""
    transfer_service = TransferService(session)
    
    is_open = transfer_service.is_transfer_window_open(gameweek, season)
    
    return {
        "success": True,
        "gameweek": gameweek,
        "season": season,
        "is_open": is_open,
        "message": "Transfer window je otvoren" if is_open else "Transfer window je zatvoren"
    } 