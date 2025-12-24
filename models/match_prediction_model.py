from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Enum as PgEnum

class PredictionType(str, Enum):
    HOME_WIN = "home_win"    # Pobjeda domaćeg tima
    DRAW = "draw"            # Neriješeno
    AWAY_WIN = "away_win"    # Pobjeda gostujućeg tima

class MatchPrediction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", description="ID korisnika koji je dao predviđanje")
    match_id: int = Field(foreign_key="match.id", description="ID utakmice")
    prediction: PredictionType = Field(sa_column=Column(PgEnum(PredictionType, name="predictiontype"), name="prediction"), description="Tip predviđanja")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Datum kreiranja predviđanja")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Datum ažuriranja predviđanja")

