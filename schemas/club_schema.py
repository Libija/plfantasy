from pydantic import BaseModel
from typing import Optional

class ClubCreate(BaseModel):
    name: str
    city: str
    year_founded: int
    stadium: str
    stadium_capacity: int
    description: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    coach: Optional[str] = None

class ClubUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    year_founded: Optional[int] = None
    stadium: Optional[str] = None
    stadium_capacity: Optional[int] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    coach: Optional[str] = None

class ClubResponse(BaseModel):
    id: int
    name: str
    city: str
    year_founded: int
    stadium: str
    stadium_capacity: int
    description: Optional[str]
    logo_url: Optional[str]
    primary_color: Optional[str]
    secondary_color: Optional[str]
    coach: Optional[str] 

    class Config:
        from_attributes = True