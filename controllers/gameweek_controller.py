from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from database import get_session
from models.gameweek_model import GameweekStatus
from schemas.gameweek_schema import GameweekCreate, GameweekUpdate, GameweekResponse, GameweekListResponse
from services.gameweek_service import GameweekService
from services.transfer_service import TransferService

router = APIRouter(prefix="/admin/gameweeks", tags=["gameweeks"])

# Javni endpointi za kola
public_router = APIRouter(prefix="/gameweeks", tags=["public-gameweeks"])

@public_router.get("/", response_model=List[GameweekListResponse])
def get_public_gameweeks(
    season: Optional[str] = Query(None, description="Filter po sezoni"),
    status: Optional[GameweekStatus] = Query(None, description="Filter po statusu"),
    db: Session = Depends(get_session)
):
    """Dohvata sva kola za javnost sa opcionalnim filterima"""
    try:
        service = GameweekService(db)
        return service.get_all_gameweeks(season=season, status=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju kola")

@public_router.get("/{gameweek_id}", response_model=GameweekResponse)
def get_public_gameweek(
    gameweek_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata kolo po ID-u za javnost"""
    try:
        service = GameweekService(db)
        gameweek = service.get_gameweek(gameweek_id)
        if not gameweek:
            raise HTTPException(status_code=404, detail="Kolo nije pronađeno")
        return gameweek
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju kola")

@public_router.get("/seasons/list")
def get_public_seasons(db: Session = Depends(get_session)):
    """Dohvata sve sezone za javnost"""
    try:
        service = GameweekService(db)
        return {"seasons": service.get_seasons()}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju sezona")

# Admin endpointi
@router.post("/", response_model=GameweekResponse)
def create_gameweek(
    gameweek_data: GameweekCreate,
    db: Session = Depends(get_session)
):
    """Kreira novo kolo"""
    try:
        print(f"Received gameweek data: {gameweek_data}")
        service = GameweekService(db)
        return service.create_gameweek(gameweek_data)
    except ValueError as e:
        print(f"ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Exception: {e}")
        raise HTTPException(status_code=500, detail="Greška pri kreiranju kola")

@router.get("/", response_model=List[GameweekListResponse])
def get_gameweeks(
    season: Optional[str] = Query(None, description="Filter po sezoni"),
    status: Optional[GameweekStatus] = Query(None, description="Filter po statusu"),
    db: Session = Depends(get_session)
):
    """Dohvata sva kola sa opcionalnim filterima"""
    try:
        service = GameweekService(db)
        return service.get_all_gameweeks(season=season, status=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju kola")

@router.get("/{gameweek_id}", response_model=GameweekResponse)
def get_gameweek(
    gameweek_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata kolo po ID-u"""
    try:
        service = GameweekService(db)
        gameweek = service.get_gameweek(gameweek_id)
        if not gameweek:
            raise HTTPException(status_code=404, detail="Kolo nije pronađeno")
        return gameweek
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju kola")

@router.put("/{gameweek_id}", response_model=GameweekResponse)
def update_gameweek(
    gameweek_id: int,
    gameweek_data: GameweekUpdate,
    db: Session = Depends(get_session)
):
    """Ažurira kolo"""
    try:
        service = GameweekService(db)
        gameweek = service.update_gameweek(gameweek_id, gameweek_data)
        if not gameweek:
            raise HTTPException(status_code=404, detail="Kolo nije pronađeno")
        
        # Automatski ažuriraj transfer window status ako se promijenio status kola
        if gameweek_data.status is not None:
            try:
                transfer_service = TransferService(db)
                transfer_service.check_and_update_transfer_window_status("2024/25")
            except Exception as e:
                print(f"Transfer window update error: {e}")
                # Ne prekidaj ažuriranje kola ako transfer window update ne uspije
        
        return gameweek
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju kola")

@router.delete("/{gameweek_id}")
def delete_gameweek(
    gameweek_id: int,
    db: Session = Depends(get_session)
):
    """Briše kolo"""
    try:
        service = GameweekService(db)
        success = service.delete_gameweek(gameweek_id)
        if not success:
            raise HTTPException(status_code=404, detail="Kolo nije pronađeno")
        return {"message": "Kolo je uspješno obrisano"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju kola")

@router.patch("/{gameweek_id}/status", response_model=GameweekResponse)
def change_gameweek_status(
    gameweek_id: int,
    status: GameweekStatus,
    db: Session = Depends(get_session)
):
    """Mijenja status kola"""
    try:
        service = GameweekService(db)
        gameweek = service.change_gameweek_status(gameweek_id, status)
        if not gameweek:
            raise HTTPException(status_code=404, detail="Kolo nije pronađeno")
        
        # Automatski ažuriraj transfer window status nakon promjene statusa kola
        transfer_service = TransferService(db)
        auto_update_result = transfer_service.check_and_update_transfer_window_status("2024/25")
        
        return {
            "gameweek": gameweek,
            "transfer_window_update": auto_update_result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri promjeni statusa")

@router.get("/seasons/list")
def get_seasons(db: Session = Depends(get_session)):
    """Dohvata sve sezone"""
    try:
        service = GameweekService(db)
        return {"seasons": service.get_seasons()}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju sezona") 