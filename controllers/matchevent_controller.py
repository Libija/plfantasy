from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from database import get_session
from schemas.matchevent_schema import MatchEventCreate, MatchEventUpdate, MatchEventResponse
from services.matchevent_service import MatchEventService

router = APIRouter(prefix="/admin/matchevents", tags=["matchevents"])

# Javni endpointi za match events
public_router = APIRouter(prefix="/matchevents", tags=["public-matchevents"])

@public_router.get("/match/{match_id}", response_model=List[MatchEventResponse])
def get_public_match_events(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata sve događaje za utakmicu za javnost"""
    try:
        service = MatchEventService(db)
        return service.get_match_events(match_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju događaja")

@public_router.get("/{event_id}", response_model=MatchEventResponse)
def get_public_event(
    event_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata događaj po ID-u za javnost"""
    try:
        service = MatchEventService(db)
        event = service.get_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Događaj nije pronađen")
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju događaja")

# Admin endpointi
@router.post("/", response_model=MatchEventResponse)
def create_event(
    event_data: MatchEventCreate,
    db: Session = Depends(get_session)
):
    """Kreira novi događaj"""
    try:
        service = MatchEventService(db)
        return service.create_event(event_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri kreiranju događaja")

@router.get("/match/{match_id}", response_model=List[MatchEventResponse])
def get_match_events(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata sve događaje za utakmicu"""
    try:
        service = MatchEventService(db)
        return service.get_match_events(match_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju događaja")

@router.get("/{event_id}", response_model=MatchEventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_session)
):
    """Dohvata događaj po ID-u"""
    try:
        service = MatchEventService(db)
        event = service.get_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Događaj nije pronađen")
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri dohvatanju događaja")

@router.put("/{event_id}", response_model=MatchEventResponse)
def update_event(
    event_id: int,
    event_data: MatchEventUpdate,
    db: Session = Depends(get_session)
):
    """Ažurira događaj"""
    try:
        service = MatchEventService(db)
        event = service.update_event(event_id, event_data)
        if not event:
            raise HTTPException(status_code=404, detail="Događaj nije pronađen")
        return event
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju događaja")

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_session)
):
    """Briše događaj"""
    try:
        service = MatchEventService(db)
        success = service.delete_event(event_id)
        if not success:
            raise HTTPException(status_code=404, detail="Događaj nije pronađen")
        return {"message": "Događaj je uspješno obrisan"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju događaja")

@router.delete("/match/{match_id}")
def delete_match_events(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Briše sve događaje za utakmicu"""
    try:
        service = MatchEventService(db)
        success = service.delete_match_events(match_id)
        if not success:
            raise HTTPException(status_code=404, detail="Utakmica nije pronađena")
        return {"message": "Svi događaji za utakmicu su uspješno obrisani"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška pri brisanju događaja") 