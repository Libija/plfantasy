from sqlmodel import Session
from typing import Optional, Dict, Any
from fastapi import HTTPException
from repositories.match_prediction_repository import (
    create_prediction, get_user_prediction, get_gameweek_predictions
)
from models.match_prediction_model import PredictionType
from schemas.match_prediction_schema import (
    MatchPredictionCreate, MatchPredictionResponse, GameweekPredictions
)

def submit_prediction_service(session: Session, user_id: int, prediction_data: MatchPredictionCreate) -> MatchPredictionResponse:
    """Kreira ili ažurira predviđanje korisnika"""
    # Provjeri da li korisnik već glasa
    existing_prediction = get_user_prediction(session, user_id, prediction_data.match_id)
    if existing_prediction:
        raise HTTPException(
            status_code=400, 
            detail="Već ste glasali na ovu utakmicu. Možete glasati samo jednom."
        )
    
    prediction = create_prediction(
        session, 
        user_id, 
        prediction_data.match_id, 
        prediction_data.prediction
    )
    return MatchPredictionResponse.model_validate(prediction)

def get_user_prediction_service(session: Session, user_id: int, match_id: int) -> Optional[MatchPredictionResponse]:
    """Dohvata predviđanje korisnika za određenu utakmicu"""
    prediction = get_user_prediction(session, user_id, match_id)
    return MatchPredictionResponse.model_validate(prediction) if prediction else None

def get_current_predictions_service(session: Session, user_id: Optional[int] = None) -> Optional[GameweekPredictions]:
    """Dohvata predviđanja za trenutno kolo"""
    data = get_gameweek_predictions(session, user_id)
    if not data:
        return None
    
    return GameweekPredictions(**data)
