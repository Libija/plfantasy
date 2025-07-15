from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class TransferWindowStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"

class TransferWindow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    season: str = Field(description="Sezona")
    status: TransferWindowStatus = Field(default=TransferWindowStatus.CLOSED)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow) 