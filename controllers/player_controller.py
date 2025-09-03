from fastapi import APIRouter, Depends, status, Query
from sqlmodel import Session
from database import get_session
from schemas.player_schema import PlayerCreate, PlayerUpdate, PlayerResponse
from services.player_service import create_player_service, list_players_service, get_player_service, update_player_service, delete_player_service, list_players_by_club_service, get_player_recent_matches_service, get_player_upcoming_matches_service 
from typing import List, Optional

router = APIRouter(prefix="/admin/players", tags=["players"])

# Javni endpointi za igrače
public_router = APIRouter(prefix="/players", tags=["public-players"])

@public_router.get("/", response_model=List[PlayerResponse])
def get_public_players(club_id: Optional[int] = Query(None), session: Session = Depends(get_session)):
    """Dohvata sve igrače ili igrače određenog kluba za javnost"""
    if club_id is not None:
        return list_players_by_club_service(session, club_id)
    return list_players_service(session)

@public_router.get("/{player_id}", response_model=PlayerResponse)
def get_public_player(player_id: int, session: Session = Depends(get_session)):
    """Dohvata igrača po ID-u za javnost"""
    return get_player_service(session, player_id)

@public_router.get("/{player_id}/recent-matches")
def get_player_recent_matches(player_id: int, limit: int = Query(5, ge=1, le=10), session: Session = Depends(get_session)):
    """Dohvata poslednje utakmice igrača sa poenima"""
    return get_player_recent_matches_service(session, player_id, limit)

@public_router.get("/{player_id}/upcoming-matches")
def get_player_upcoming_matches(player_id: int, limit: int = Query(3, ge=1, le=5), session: Session = Depends(get_session)):
    """Dohvata sledeće utakmice igrača"""
    return get_player_upcoming_matches_service(session, player_id, limit)

# No image_url handling needed
# Nationality handled via schema

@router.post("/create", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED)
def create_player(data: PlayerCreate, session: Session = Depends(get_session)):
    print("[DEBUG] Incoming player payload:", data)
    return create_player_service(session, data)

@router.get("/", response_model=List[PlayerResponse])
def list_players(club_id: Optional[int] = Query(None), session: Session = Depends(get_session)):
    if club_id is not None:
        return list_players_by_club_service(session, club_id)
    return list_players_service(session)

@router.get("/{player_id}", response_model=PlayerResponse)
def get_player(player_id: int, session: Session = Depends(get_session)):
    return get_player_service(session, player_id)

@router.put("/{player_id}", response_model=PlayerResponse)
def update_player(player_id: int, data: PlayerUpdate, session: Session = Depends(get_session)):
    return update_player_service(session, player_id, data)

@router.delete("/{player_id}")
def delete_player(player_id: int, session: Session = Depends(get_session)):
    return delete_player_service(session, player_id) 