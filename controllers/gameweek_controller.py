from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from database import get_session
from models.gameweek_model import GameweekStatus
from schemas.gameweek_schema import GameweekCreate, GameweekUpdate, GameweekResponse, GameweekListResponse
from services.gameweek_service import GameweekService

router = APIRouter(prefix="/admin/gameweeks", tags=["gameweeks"])

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
        return gameweek
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