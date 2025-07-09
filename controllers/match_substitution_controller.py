from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from database import get_session
from schemas.match_substitution_schema import MatchSubstitutionCreate, MatchSubstitutionUpdate, MatchSubstitutionResponse, MatchSubstitutionWithPlayersResponse
from services.match_substitution_service import MatchSubstitutionService

router = APIRouter(prefix="/api/match-substitutions", tags=["match-substitutions"])

@router.post("/", response_model=MatchSubstitutionResponse)
def create_substitution(
    substitution_data: MatchSubstitutionCreate,
    db: Session = Depends(get_session)
):
    """Kreira novu izmjenu"""
    try:
        service = MatchSubstitutionService(db)
        return service.create_substitution(substitution_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri kreiranju izmjene")

@router.get("/match/{match_id}", response_model=List[MatchSubstitutionWithPlayersResponse])
def get_match_substitutions(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata sve izmjene za utakmicu"""
    try:
        service = MatchSubstitutionService(db)
        return service.get_match_substitutions(match_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju izmjena")

@router.get("/{substitution_id}", response_model=MatchSubstitutionResponse)
def get_substitution(
    substitution_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata izmjenu po ID-u"""
    try:
        service = MatchSubstitutionService(db)
        substitution = service.get_substitution(substitution_id)
        if not substitution:
            raise HTTPException(status_code=404, detail="Izmjena nije pronađena")
        return substitution
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju izmjene")

@router.put("/{substitution_id}", response_model=MatchSubstitutionResponse)
def update_substitution(
    substitution_id: int,
    substitution_data: MatchSubstitutionUpdate,
    db: Session = Depends(get_session)
):
    """Ažurira izmjenu"""
    try:
        service = MatchSubstitutionService(db)
        substitution = service.update_substitution(substitution_id, substitution_data)
        if not substitution:
            raise HTTPException(status_code=404, detail="Izmjena nije pronađena")
        return substitution
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju izmjene")

@router.delete("/{substitution_id}")
def delete_substitution(
    substitution_id: int,
    db: Session = Depends(get_session)
):
    """Briše izmjenu"""
    try:
        service = MatchSubstitutionService(db)
        success = service.delete_substitution(substitution_id)
        if not success:
            raise HTTPException(status_code=404, detail="Izmjena nije pronađena")
        return {"message": "Izmjena je uspješno obrisana"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju izmjene")

@router.delete("/match/{match_id}")
def delete_match_substitutions(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Briše sve izmjene za utakmicu"""
    try:
        service = MatchSubstitutionService(db)
        success = service.delete_match_substitutions(match_id)
        if not success:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return {"message": "Sve izmjene za utakmicu su uspješno obrisane"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju izmjena") 