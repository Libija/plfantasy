from sqlmodel import SQLModel, Field
from typing import Optional

class Club(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    city: str
    year_founded: int
    stadium: str
    stadium_capacity: int
    description: Optional[str]
    logo_url: Optional[str]
    primary_color: Optional[str]
    secondary_color: Optional[str]
