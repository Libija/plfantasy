from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum

class Position(str, Enum):
    GK = "GK"
    DEF = "DEF"
    MID = "MID"
    FWD = "FWD"

class Player(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    club_id: int = Field(foreign_key="club.id")
    position: Position
    price: float
    shirt_number: Optional[int]
    image_url: Optional[str]
