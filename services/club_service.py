from sqlmodel import Session
from models.club_model import Club
from repositories.club_repository import create_club, get_all_clubs, get_club_by_id, update_club, delete_club
from schemas.club_schema import ClubCreate, ClubUpdate, ClubResponse
from fastapi import HTTPException
from typing import List

def create_club_service(session: Session, data: ClubCreate) -> ClubResponse:
    club = Club(**data.dict())
    club = create_club(session, club)
    return ClubResponse.from_orm(club)

def list_clubs_service(session: Session) -> List[ClubResponse]:
    clubs = get_all_clubs(session)
    return [ClubResponse.from_orm(club) for club in clubs]

def get_club_service(session: Session, club_id: int) -> ClubResponse:
    club = get_club_by_id(session, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return ClubResponse.from_orm(club)

def update_club_service(session: Session, club_id: int, data: ClubUpdate) -> ClubResponse:
    club = get_club_by_id(session, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(club, field, value)
    club = update_club(session, club)
    return ClubResponse.from_orm(club)

def delete_club_service(session: Session, club_id: int):
    club = get_club_by_id(session, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    delete_club(session, club)
    return {"msg": "Club deleted"} 