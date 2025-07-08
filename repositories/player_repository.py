from sqlmodel import Session, select
from models.player_model import Player
from typing import List, Optional

# No image_url handling needed
# Nationality handled via model

def create_player(session: Session, player: Player) -> Player:
    session.add(player)
    session.commit()
    session.refresh(player)
    return player

def get_all_players(session: Session) -> List[Player]:
    return session.exec(select(Player)).all()

def get_player_by_id(session: Session, player_id: int) -> Optional[Player]:
    return session.get(Player, player_id)

def get_players_by_club(session: Session, club_id: int) -> List[Player]:
    return session.exec(select(Player).where(Player.club_id == club_id)).all()

def update_player(session: Session, player: Player) -> Player:
    session.add(player)
    session.commit()
    session.refresh(player)
    return player

def delete_player(session: Session, player: Player):
    session.delete(player)
    session.commit() 