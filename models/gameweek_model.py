from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Gameweek(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    number: int
    start_date: datetime
    end_date: datetime
