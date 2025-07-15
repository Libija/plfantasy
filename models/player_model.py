from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from sqlalchemy import Column, Enum as PgEnum

class Position(str, Enum):
    GK = "GK"
    DEF = "DEF"
    MID = "MID"
    FWD = "FWD"

class Nationality(str, Enum):
    BIH = "BIH"
    HRV = "HRV"
    SLO = "SLO"
    SRB = "SRB"
    MNE = "MNE"
    MKD = "MKD"
    OTHER = "OTHER"

class Player(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    club_id: int = Field(foreign_key="club.id")
    position: Position = Field(sa_column=Column(PgEnum(Position, name="playerposition"), name="position"))
    price: float
    shirt_number: Optional[int]
    nationality: Nationality = Field(default=Nationality.OTHER, sa_column=Column(PgEnum(Nationality, name="playernationality"), name="nationality"))
