from sqlmodel import Session
from models.player_model import Player
from repositories.player_repository import create_player, get_all_players, get_player_by_id, get_players_by_club, update_player, delete_player
from schemas.player_schema import PlayerCreate, PlayerUpdate, PlayerResponse
from fastapi import HTTPException
from typing import List

# No image_url handling needed

def create_player_service(session: Session, data: PlayerCreate) -> PlayerResponse:
    player = Player(**data.dict())
    player = create_player(session, player)
    return PlayerResponse.from_orm(player)

def list_players_service(session: Session) -> List[PlayerResponse]:
    players = get_all_players(session)
    return [PlayerResponse.from_orm(player) for player in players]

def get_player_service(session: Session, player_id: int) -> PlayerResponse:
    player = get_player_by_id(session, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return PlayerResponse.from_orm(player)

def list_players_by_club_service(session: Session, club_id: int) -> List[PlayerResponse]:
    players = get_players_by_club(session, club_id)
    player_responses = []
    
    for player in players:
        player_dict = {
            "id": player.id,
            "name": player.name,
            "club_id": player.club_id,
            "position": player.position,
            "price": player.price,
            "shirt_number": player.shirt_number,
            "nationality": player.nationality
        }
        
        # Dohvati ime kluba
        from models.club_model import Club
        club = session.get(Club, player.club_id)
        if club:
            player_dict["club_name"] = club.name
        
        player_responses.append(PlayerResponse(**player_dict))
    
    return player_responses

def update_player_service(session: Session, player_id: int, data: PlayerUpdate) -> PlayerResponse:
    player = get_player_by_id(session, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(player, field, value)
    player = update_player(session, player)
    return PlayerResponse.from_orm(player)

def delete_player_service(session: Session, player_id: int):
    player = get_player_by_id(session, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    delete_player(session, player)
    return {"msg": "Player deleted"} 