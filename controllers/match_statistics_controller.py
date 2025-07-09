from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from database import get_session
from schemas.match_statistics_schema import MatchStatisticsCreate, MatchStatisticsUpdate, MatchStatisticsResponse, MatchStatisticsWithClubResponse
from services.match_statistics_service import MatchStatisticsService

router = APIRouter(prefix="/api/match-statistics", tags=["match-statistics"])

@router.post("/", response_model=MatchStatisticsResponse)
def create_statistics(
    statistics_data: MatchStatisticsCreate,
    db: Session = Depends(get_session)
):
    """Kreira nove statistike"""
    try:
        service = MatchStatisticsService(db)
        return service.create_statistics(statistics_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri kreiranju statistika")

@router.get("/match/{match_id}", response_model=List[MatchStatisticsWithClubResponse])
def get_match_statistics(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata sve statistike za utakmicu"""
    try:
        service = MatchStatisticsService(db)
        return service.get_match_statistics(match_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju statistika")

@router.get("/match/{match_id}/club/{club_id}", response_model=MatchStatisticsResponse)
def get_club_statistics(
    match_id: int,
    club_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata statistike za određeni klub u utakmici"""
    try:
        service = MatchStatisticsService(db)
        statistics = service.get_club_statistics(match_id, club_id)
        if not statistics:
            raise HTTPException(status_code=404, detail="Statistike nisu pronađene")
        return statistics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju statistika")

@router.get("/{statistics_id}", response_model=MatchStatisticsResponse)
def get_statistics(
    statistics_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata statistike po ID-u"""
    try:
        service = MatchStatisticsService(db)
        statistics = service.get_statistics(statistics_id)
        if not statistics:
            raise HTTPException(status_code=404, detail="Statistike nisu pronađene")
        return statistics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju statistika")

@router.put("/{statistics_id}", response_model=MatchStatisticsResponse)
def update_statistics(
    statistics_id: int,
    statistics_data: MatchStatisticsUpdate,
    db: Session = Depends(get_session)
):
    """Ažurira statistike"""
    try:
        service = MatchStatisticsService(db)
        statistics = service.update_statistics(statistics_id, statistics_data)
        if not statistics:
            raise HTTPException(status_code=404, detail="Statistike nisu pronađene")
        return statistics
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju statistika")

@router.patch("/match/{match_id}/club/{club_id}", response_model=MatchStatisticsResponse)
def update_or_create_statistics(
    match_id: int,
    club_id: int,
    statistics_data: MatchStatisticsUpdate,
    db: Session = Depends(get_session)
):
    """Ažurira postojeće ili kreira nove statistike"""
    try:
        service = MatchStatisticsService(db)
        return service.update_or_create_statistics(match_id, club_id, statistics_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju statistika")

@router.delete("/{statistics_id}")
def delete_statistics(
    statistics_id: int,
    db: Session = Depends(get_session)
):
    """Briše statistike"""
    try:
        service = MatchStatisticsService(db)
        success = service.delete_statistics(statistics_id)
        if not success:
            raise HTTPException(status_code=404, detail="Statistike nisu pronađene")
        return {"message": "Statistike su uspješno obrisane"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju statistika")

@router.delete("/match/{match_id}")
def delete_match_statistics(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Briše sve statistike za utakmicu"""
    try:
        service = MatchStatisticsService(db)
        success = service.delete_match_statistics(match_id)
        if not success:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return {"message": "Sve statistike za utakmicu su uspješno obrisane"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju statistika") 