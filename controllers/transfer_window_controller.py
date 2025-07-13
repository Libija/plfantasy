from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from services.transfer_service import TransferService
from models.transfer_window_model import TransferWindow, TransferWindowStatus
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/admin/transfer-windows", tags=["Transfer Windows"])

@router.post("/", response_model=Dict[str, Any])
def create_transfer_window(
    season: str,
    session: Session = Depends(get_session)
):
    """Kreira globalni transfer window za sezonu"""
    transfer_service = TransferService(session)
    
    try:
        transfer_window = transfer_service.create_transfer_window(season)
        
        return {
            "success": True,
            "message": f"Transfer window kreiran za sezonu {season}",
            "transfer_window": {
                "id": transfer_window.id,
                "season": transfer_window.season,
                "status": transfer_window.status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{transfer_window_id}/open", response_model=Dict[str, Any])
def open_transfer_window(
    transfer_window_id: int,
    session: Session = Depends(get_session)
):
    """Otvara transfer window"""
    transfer_service = TransferService(session)
    
    transfer_window = transfer_service.open_transfer_window(transfer_window_id)
    if not transfer_window:
        raise HTTPException(status_code=404, detail="Transfer window nije pronađen")
    
    return {
        "success": True,
        "message": f"Transfer window za sezonu {transfer_window.season} je otvoren",
        "transfer_window": {
            "id": transfer_window.id,
            "season": transfer_window.season,
            "status": transfer_window.status
        }
    }

@router.put("/{transfer_window_id}/close", response_model=Dict[str, Any])
def close_transfer_window(
    transfer_window_id: int,
    session: Session = Depends(get_session)
):
    """Zatvara transfer window"""
    transfer_service = TransferService(session)
    
    transfer_window = transfer_service.close_transfer_window(transfer_window_id)
    if not transfer_window:
        raise HTTPException(status_code=404, detail="Transfer window nije pronađen")
    
    return {
        "success": True,
        "message": f"Transfer window za sezonu {transfer_window.season} je zatvoren",
        "transfer_window": {
            "id": transfer_window.id,
            "season": transfer_window.season,
            "status": transfer_window.status
        }
    }

@router.get("/current/{season}", response_model=Dict[str, Any])
def get_current_transfer_window(
    season: str,
    session: Session = Depends(get_session)
):
    """Dohvati trenutni transfer window"""
    transfer_service = TransferService(session)
    
    transfer_window = transfer_service.get_current_transfer_window(season)
    if not transfer_window:
        return {
            "success": False,
            "message": "Nema aktivnog transfer window-a",
            "transfer_window": None
        }
    
    return {
        "success": True,
        "transfer_window": {
            "id": transfer_window.id,
            "season": transfer_window.season,
            "status": transfer_window.status
        }
    }

@router.get("/status/{season}", response_model=Dict[str, Any])
def check_transfer_window_status(
    season: str,
    session: Session = Depends(get_session)
):
    """Provjeri status transfer window-a za sezonu"""
    transfer_service = TransferService(session)
    
    is_open = transfer_service.is_transfer_window_open(season)
    
    return {
        "success": True,
        "season": season,
        "is_open": is_open,
        "message": "Transfer window je otvoren" if is_open else "Transfer window je zatvoren"
    }

@router.post("/auto-update", response_model=Dict[str, Any])
def auto_update_transfer_window_status(
    season: str = "2024/25",
    session: Session = Depends(get_session)
):
    """Automatski ažuriraj status transfer window-a na osnovu statusa kolja"""
    transfer_service = TransferService(session)
    
    result = transfer_service.check_and_update_transfer_window_status(season)
    
    return result

@router.get("/", response_model=Dict[str, Any])
def get_transfer_windows(
    season: str = "2024/25",
    session: Session = Depends(get_session)
):
    """Dohvati sve transfer window-e za određenu sezonu"""
    transfer_service = TransferService(session)
    
    transfer_windows = transfer_service.get_transfer_windows_by_season(season)
    
    return {
        "success": True,
        "transfer_windows": [
            {
                "id": tw.id,
                "season": tw.season,
                "status": tw.status
            }
            for tw in transfer_windows
        ]
    } 