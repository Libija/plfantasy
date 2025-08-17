from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from database import get_session
from models.match_model import MatchStatus
from schemas.match_schema import MatchCreate, MatchUpdate, MatchResponse, MatchListResponse, MatchWithClubsResponse
from services.match_service import MatchService

router = APIRouter(prefix="/admin/matches", tags=["matches"])

# Javni endpointi za utakmice
public_router = APIRouter(prefix="/matches", tags=["public-matches"])

@public_router.get("/club/{club_id}/recent", response_model=List[MatchListResponse])
def get_recent_matches_by_club(
    club_id: int,
    limit: Optional[int] = Query(5, description="Broj utakmica za prikaz"),
    db: Session = Depends(get_session)
):
    """Dohvata nedavne utakmice za određeni klub (zadnjih 5 završenih)"""
    try:
        service = MatchService(db)
        return service.get_recent_matches_by_club(club_id, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju nedavnih utakmica")

@public_router.get("/club/{club_id}/upcoming", response_model=List[MatchListResponse])
def get_upcoming_matches_by_club(
    club_id: int,
    limit: Optional[int] = Query(5, description="Broj utakmica za prikaz"),
    db: Session = Depends(get_session)
):
    """Dohvata nadolazeće utakmice za određeni klub (sljedećih 5 zakazanih)"""
    try:
        service = MatchService(db)
        return service.get_upcoming_matches_by_club(club_id, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju nadolazećih utakmica")

@public_router.get("/", response_model=List[MatchListResponse])
def get_public_matches(
    gameweek_id: Optional[int] = Query(None, description="Filter po kolu"),
    status: Optional[MatchStatus] = Query(None, description="Filter po statusu"),
    db: Session = Depends(get_session)
):
    """Dohvata sve utakmice za javnost sa opcionalnim filterima"""
    try:
        service = MatchService(db)
        return service.get_all_matches(gameweek_id=gameweek_id, status=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju utakmica")

@public_router.get("/{match_id}", response_model=MatchResponse)
def get_public_match(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata utakmicu po ID-u za javnost"""
    try:
        service = MatchService(db)
        match = service.get_match(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return match
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju utakmice")

@public_router.get("/{match_id}/detailed", response_model=MatchWithClubsResponse)
def get_public_match_with_clubs(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata utakmicu sa detaljnim informacijama o klubovima za javnost"""
    try:
        service = MatchService(db)
        match = service.get_match_with_clubs(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return match
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju utakmice")

# Admin endpointi
@router.post("/", response_model=MatchResponse)
def create_match(
    match_data: MatchCreate,
    db: Session = Depends(get_session)
):
    """Kreira novu utakmicu"""
    try:
        service = MatchService(db)
        return service.create_match(match_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri kreiranju utakmice")

@router.get("/", response_model=List[MatchListResponse])
def get_matches(
    gameweek_id: Optional[int] = Query(None, description="Filter po kolu"),
    status: Optional[MatchStatus] = Query(None, description="Filter po statusu"),
    db: Session = Depends(get_session)
):
    """Dohvata sve utakmice sa opcionalnim filterima"""
    try:
        service = MatchService(db)
        return service.get_all_matches(gameweek_id=gameweek_id, status=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju utakmica")

@router.get("/gameweek/{gameweek_id}", response_model=List[MatchListResponse])
def get_matches_by_gameweek(
    gameweek_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata sve utakmice za određeno kolo"""
    try:
        service = MatchService(db)
        return service.get_matches_by_gameweek(gameweek_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju utakmica kola")

@router.get("/{match_id}", response_model=MatchResponse)
def get_match(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata utakmicu po ID-u"""
    try:
        service = MatchService(db)
        match = service.get_match(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return match
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju utakmice")

@router.get("/{match_id}/detailed", response_model=MatchWithClubsResponse)
def get_match_with_clubs(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata utakmicu sa detaljnim informacijama o klubovima"""
    try:
        service = MatchService(db)
        match = service.get_match_with_clubs(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return match
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju utakmice")

@router.put("/{match_id}", response_model=MatchResponse)
def update_match(
    match_id: int,
    match_data: MatchUpdate,
    db: Session = Depends(get_session)
):
    """Ažurira utakmicu"""
    try:
        service = MatchService(db)
        match = service.update_match(match_id, match_data)
        if not match:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return match
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju utakmice")

@router.delete("/{match_id}")
def delete_match(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Briše utakmicu"""
    try:
        service = MatchService(db)
        success = service.delete_match(match_id)
        if not success:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return {"message": "Utakmica je uspješno obrisana"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju utakmice")

@router.patch("/{match_id}/status", response_model=MatchResponse)
def change_match_status(
    match_id: int,
    status: MatchStatus,
    db: Session = Depends(get_session)
):
    """Mijenja status utakmice"""
    try:
        service = MatchService(db)
        match = service.change_match_status(match_id, status)
        if not match:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return match
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri promjeni statusa")

from pydantic import BaseModel

class MatchScoreUpdate(BaseModel):
    home_score: int
    away_score: int

@router.patch("/{match_id}/score", response_model=MatchResponse)
def update_match_score(
    match_id: int,
    score_data: MatchScoreUpdate,
    db: Session = Depends(get_session)
):
    """Ažurira rezultat utakmice"""
    try:
        service = MatchService(db)
        match = service.update_match_score(match_id, score_data.home_score, score_data.away_score)
        if not match:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return match
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju rezultata") 