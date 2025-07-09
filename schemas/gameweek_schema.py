from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from models.gameweek_model import GameweekStatus

class GameweekBase(BaseModel):
    number: int
    season: str
    start_date: datetime
    end_date: datetime
    status: GameweekStatus = GameweekStatus.SCHEDULED

    @validator('number')
    def validate_number(cls, v):
        if v < 1 or v > 33:
            raise ValueError('Broj kola mora biti između 1 i 33')
        return v

    @validator('season')
    def validate_season(cls, v):
        if not v:
            raise ValueError('Sezona je obavezna')
        if not isinstance(v, str):
            raise ValueError('Sezona mora biti string')
        if '/' not in v:
            raise ValueError('Sezona mora biti u formatu YYYY/YY')
        return v

    @validator('end_date')
    def validate_dates(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('Datum završetka mora biti nakon datuma početka')
        return v

class GameweekCreate(GameweekBase):
    pass

class GameweekUpdate(BaseModel):
    number: Optional[int] = None
    season: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[GameweekStatus] = None

    @validator('number')
    def validate_number(cls, v):
        if v is not None and (v < 1 or v > 33):
            raise ValueError('Broj kola mora biti između 1 i 33')
        return v

    @validator('season')
    def validate_season(cls, v):
        if v is not None and ('/' not in v):
            raise ValueError('Sezona mora biti u formatu YYYY/YY')
        return v

class GameweekResponse(GameweekBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GameweekListResponse(BaseModel):
    id: int
    number: int
    season: str
    start_date: datetime
    end_date: datetime
    status: GameweekStatus
    match_count: int = 0  # Broj utakmica u kolu

    class Config:
        from_attributes = True 