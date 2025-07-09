from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from database import get_session
from schemas.match_lineup_schema import MatchLineupCreate, MatchLineupUpdate, MatchLineupResponse, MatchLineupWithPlayerResponse, MatchLineupBulkCreate
from services.match_lineup_service import MatchLineupService

router = APIRouter(prefix="/api/match-lineups", tags=["match-lineups"])

@router.post("/", response_model=MatchLineupResponse)
def create_lineup(
    lineup_data: MatchLineupCreate,
    db: Session = Depends(get_session)
):
    """Kreira novu postavu"""
    try:
        service = MatchLineupService(db)
        return service.create_lineup(lineup_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri kreiranju postave")

@router.post("/bulk", response_model=List[MatchLineupResponse])
def create_bulk_lineups(
    bulk_data: MatchLineupBulkCreate,
    db: Session = Depends(get_session)
):
    """Kreira više postava odjednom"""
    try:
        service = MatchLineupService(db)
        return service.create_bulk_lineups(bulk_data.match_id, bulk_data.lineups)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri kreiranju postava")

@router.get("/match/{match_id}", response_model=List[MatchLineupWithPlayerResponse])
def get_match_lineups(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata sve postave za utakmicu"""
    try:
        service = MatchLineupService(db)
        return service.get_match_lineups(match_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju postava")

@router.get("/{lineup_id}", response_model=MatchLineupResponse)
def get_lineup(
    lineup_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata postavu po ID-u"""
    try:
        service = MatchLineupService(db)
        lineup = service.get_lineup(lineup_id)
        if not lineup:
            raise HTTPException(status_code=404, detail="Postava nije pronađena")
        return lineup
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju postave")

@router.put("/{lineup_id}", response_model=MatchLineupResponse)
def update_lineup(
    lineup_id: int,
    lineup_data: MatchLineupUpdate,
    db: Session = Depends(get_session)
):
    """Ažurira postavu"""
    try:
        service = MatchLineupService(db)
        lineup = service.update_lineup(lineup_id, lineup_data)
        if not lineup:
            raise HTTPException(status_code=404, detail="Postava nije pronađena")
        return lineup
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju postave")

@router.delete("/{lineup_id}")
def delete_lineup(
    lineup_id: int,
    db: Session = Depends(get_session)
):
    """Briše postavu"""
    try:
        service = MatchLineupService(db)
        success = service.delete_lineup(lineup_id)
        if not success:
            raise HTTPException(status_code=404, detail="Postava nije pronađena")
        return {"message": "Postava je uspješno obrisana"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju postave")

@router.delete("/match/{match_id}")
def delete_match_lineups(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Briše sve postave za utakmicu"""
    try:
        service = MatchLineupService(db)
        success = service.delete_match_lineups(match_id)
        if not success:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return {"message": "Sve postave za utakmicu su uspješno obrisane"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju postava") 