from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from database import get_session
from schemas.club_schema import ClubCreate, ClubUpdate, ClubResponse
from services.club_service import create_club_service, list_clubs_service, get_club_service, update_club_service, delete_club_service
from typing import List

router = APIRouter(prefix="/admin/clubs", tags=["clubs"])

@router.post("/create", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
def create_club(data: ClubCreate, session: Session = Depends(get_session)):
    return create_club_service(session, data)

@router.get("/", response_model=List[ClubResponse])
def list_clubs(session: Session = Depends(get_session)):
    return list_clubs_service(session)

@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id: int, session: Session = Depends(get_session)):
    return get_club_service(session, club_id)

@router.put("/{club_id}", response_model=ClubResponse)
def update_club(club_id: int, data: ClubUpdate, session: Session = Depends(get_session)):
    return update_club_service(session, club_id, data)

@router.delete("/{club_id}")
def delete_club(club_id: int, session: Session = Depends(get_session)):
    return delete_club_service(session, club_id) 