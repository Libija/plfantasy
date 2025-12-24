from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session
from typing import Optional
from database import get_session
from services.match_prediction_service import (
    submit_prediction_service, get_user_prediction_service, get_current_predictions_service
)
from schemas.match_prediction_schema import (
    MatchPredictionCreate, MatchPredictionResponse, GameweekPredictions
)
from controllers.user_controller import verify_access_token

router = APIRouter(prefix="/predictions", tags=["match-predictions"])

def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """Dohvata user_id iz JWT tokena"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.split(" ")[1]
        payload = verify_access_token(token)
        return int(payload.get("sub"))
    except:
        return None

@router.get("/current", response_model=GameweekPredictions)
def get_current_predictions(
    session: Session = Depends(get_session),
    authorization: Optional[str] = Header(None)
):
    """Dohvata predviđanja za trenutno kolo"""
    user_id = get_current_user_id(authorization)
    result = get_current_predictions_service(session, user_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Nema dostupnih kola za predviđanja")
    
    return result

@router.post("/submit", response_model=MatchPredictionResponse)
def submit_prediction(
    prediction_data: MatchPredictionCreate,
    session: Session = Depends(get_session),
    authorization: Optional[str] = Header(None)
):
    """Kreira ili ažurira predviđanje korisnika"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Morate biti prijavljeni da biste glasali")
    
    return submit_prediction_service(session, user_id, prediction_data)

@router.get("/match/{match_id}", response_model=Optional[MatchPredictionResponse])
def get_match_prediction(
    match_id: int,
    session: Session = Depends(get_session),
    authorization: Optional[str] = Header(None)
):
    """Dohvata predviđanje korisnika za određenu utakmicu"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        return None
    
    return get_user_prediction_service(session, user_id, match_id)


