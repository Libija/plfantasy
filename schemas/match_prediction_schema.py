from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.match_prediction_model import PredictionType

class MatchPredictionBase(BaseModel):
    match_id: int
    prediction: PredictionType

class MatchPredictionCreate(MatchPredictionBase):
    pass

class MatchPredictionUpdate(BaseModel):
    prediction: PredictionType

class MatchPredictionResponse(MatchPredictionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MatchWithPrediction(BaseModel):
    match_id: int
    home_club_id: int
    home_club_name: str
    home_club_logo: Optional[str]
    away_club_id: int
    away_club_name: str
    away_club_logo: Optional[str]
    match_date: datetime
    stadium: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: str
    user_prediction: Optional[PredictionType] = None
    user_voted: bool = False
    prediction_stats: dict  # {"home_win": 45, "draw": 10, "away_win": 45}

class GameweekPredictions(BaseModel):
    gameweek_id: int
    gameweek_number: int
    gameweek_status: str
    matches: List[MatchWithPrediction]
    can_vote: bool  # True ako je SCHEDULED, False ako je IN_PROGRESS
