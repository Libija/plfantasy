from pydantic import BaseModel
from typing import Optional
from models.player_model import Position, Nationality

class PlayerCreate(BaseModel):
    name: str
    club_id: int
    position: Position
    price: float
    shirt_number: Optional[int] = None
    nationality: Nationality = Nationality.OTHER

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    club_id: Optional[int] = None
    position: Optional[Position] = None
    price: Optional[float] = None
    shirt_number: Optional[int] = None
    nationality: Optional[Nationality] = None

class PlayerResponse(BaseModel):
    id: int
    name: str
    club_id: int
    position: Position
    price: float
    shirt_number: Optional[int]
    nationality: Nationality

    class Config:
        from_attributes = True 