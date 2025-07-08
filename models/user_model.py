from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum

class Role(str, Enum):
    user = "user"
    admin = "admin"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str
    hashed_password: str
    role: Role = Field(default=Role.user)
