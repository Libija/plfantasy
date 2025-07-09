from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from models.match_model import MatchStatus

class MatchBase(BaseModel):
    home_club_id: int
    away_club_id: int
    gameweek_id: Optional[int] = None
    date: datetime
    stadium: str
    referee: Optional[str] = None
    status: MatchStatus = MatchStatus.SCHEDULED

    @validator('home_club_id')
    def validate_home_club(cls, v):
        if v <= 0:
            raise ValueError('ID domaćeg kluba mora biti pozitivan broj')
        return v

    @validator('away_club_id')
    def validate_away_club(cls, v):
        if v <= 0:
            raise ValueError('ID gostujućeg kluba mora biti pozitivan broj')
        return v

    @validator('away_club_id')
    def validate_different_clubs(cls, v, values):
        if 'home_club_id' in values and v == values['home_club_id']:
            raise ValueError('Domaći i gostujući klub ne mogu biti isti')
        return v

    @validator('stadium')
    def validate_stadium(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Naziv stadiona je obavezan')
        return v.strip()

class MatchCreate(MatchBase):
    pass

class MatchUpdate(BaseModel):
    home_club_id: Optional[int] = None
    away_club_id: Optional[int] = None
    gameweek_id: Optional[int] = None
    date: Optional[datetime] = None
    stadium: Optional[str] = None
    referee: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: Optional[MatchStatus] = None

    @validator('home_club_id')
    def validate_home_club(cls, v):
        if v is not None and v <= 0:
            raise ValueError('ID domaćeg kluba mora biti pozitivan broj')
        return v

    @validator('away_club_id')
    def validate_away_club(cls, v):
        if v is not None and v <= 0:
            raise ValueError('ID gostujućeg kluba mora biti pozitivan broj')
        return v

    @validator('stadium')
    def validate_stadium(cls, v):
        if v is not None and len(v.strip()) == 0:
            raise ValueError('Naziv stadiona ne može biti prazan')
        return v.strip() if v else v

class MatchResponse(MatchBase):
    id: int
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MatchListResponse(BaseModel):
    id: int
    home_club_id: int
    away_club_id: int
    gameweek_id: Optional[int] = None
    date: datetime
    stadium: str
    referee: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: MatchStatus
    home_club_name: Optional[str] = None
    home_club_logo: Optional[str] = None
    away_club_name: Optional[str] = None
    away_club_logo: Optional[str] = None

    class Config:
        from_attributes = True

class MatchWithClubsResponse(BaseModel):
    id: int
    home_club_id: int
    away_club_id: int
    gameweek_id: Optional[int] = None
    date: datetime
    stadium: str
    referee: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: MatchStatus
    home_club: dict  # {id, name, logo_url}
    away_club: dict  # {id, name, logo_url}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 