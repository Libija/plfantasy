from sqlmodel import Session, select, desc, asc
from models.player_model import Player
from models.match_model import Match, MatchStatus
from models.club_model import Club
from models.gameweek_model import Gameweek, GameweekStatus
from models.playerfantasypoints_model import PlayerFantasyPoints
from repositories.player_repository import create_player, get_all_players, get_player_by_id, get_players_by_club, update_player, delete_player
from schemas.player_schema import PlayerCreate, PlayerUpdate, PlayerResponse
from fastapi import HTTPException
from typing import List, Dict, Any
from datetime import datetime

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

def get_player_recent_matches_service(session: Session, player_id: int, limit: int = 3) -> Dict[str, Any]:
    """Dohvata poslednje utakmice igrača sa poenima"""
    
    # Proveri da li igrač postoji
    player = get_player_by_id(session, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Dohvati klub igrača
    club = session.get(Club, player.club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Player's club not found")
    
    # Dohvati ukupan broj poslednjih utakmica
    total_recent_matches = session.exec(
        select(Match)
        .where(
            (Match.home_club_id == player.club_id) | (Match.away_club_id == player.club_id),
            Match.status == MatchStatus.COMPLETED
        )
        .order_by(desc(Match.date))
    ).all()
    
    # Dohvati poslednje utakmice kluba (ograničeno)
    completed_matches = total_recent_matches[:limit]
    
    matches_data = []
    
    for match in completed_matches:
        # Dohvati protivnički klub
        opponent_club_id = match.away_club_id if match.home_club_id == player.club_id else match.home_club_id
        opponent_club = session.get(Club, opponent_club_id)
        
        # Dohvati fantasy poene igrača za ovu utakmicu
        fantasy_points = session.exec(
            select(PlayerFantasyPoints)
            .where(
                PlayerFantasyPoints.player_id == player_id,
                PlayerFantasyPoints.match_id == match.id
            )
        ).first()
        
        # Dohvati kolo
        gameweek = session.get(Gameweek, match.gameweek_id) if match.gameweek_id else None
        
        # Odredi da li je igrač igrao kod kuće ili u gostima
        is_home = match.home_club_id == player.club_id
        
        matches_data.append({
            "match_id": match.id,
            "date": match.date,
            "gameweek": gameweek.number if gameweek else None,
            "opponent": opponent_club.name if opponent_club else "Unknown",
            "opponent_id": opponent_club_id,
            "is_home": is_home,
            "home_score": match.home_score,
            "away_score": match.away_score,
            "fantasy_points": fantasy_points.points if fantasy_points else 0,
            "stadium": match.stadium
        })
    
    return {
        "player_id": player_id,
        "player_name": player.name,
        "club_name": club.name,
        "recent_matches": matches_data,
        "total_matches": len(matches_data),
        "has_more_recent": len(total_recent_matches) > limit
    }

def get_player_upcoming_matches_service(session: Session, player_id: int, limit: int = 2) -> Dict[str, Any]:
    """Dohvata sledeće utakmice igrača"""
    
    # Proveri da li igrač postoji
    player = get_player_by_id(session, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Dohvati klub igrača
    club = session.get(Club, player.club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Player's club not found")
    
    # Dohvati ukupan broj sledećih utakmica (sve buduće utakmice kluba)
    print(f"DEBUG get_player_upcoming_matches: Tražim utakmice za klub {player.club_id}")
    print(f"DEBUG get_player_upcoming_matches: Trenutno vrijeme: {datetime.utcnow()}")
    
    # Prvo proveri sve utakmice kluba
    all_club_matches = session.exec(
        select(Match)
        .where(
            (Match.home_club_id == player.club_id) | (Match.away_club_id == player.club_id)
        )
        .order_by(asc(Match.date))
    ).all()
    
    print(f"DEBUG get_player_upcoming_matches: Ukupno utakmica kluba: {len(all_club_matches)}")
    for match in all_club_matches:
        print(f"DEBUG get_player_upcoming_matches: Utakmica {match.id} - Status: {match.status}, Datum: {match.date}")
    
    total_upcoming_matches = session.exec(
        select(Match)
        .where(
            (Match.home_club_id == player.club_id) | (Match.away_club_id == player.club_id),
            Match.status == MatchStatus.SCHEDULED
        )
        .order_by(asc(Match.date))
    ).all()
    
    print(f"DEBUG get_player_upcoming_matches: Pronađeno {len(total_upcoming_matches)} zakazanih utakmica u budućnosti")
    
    # Dohvati utakmice igrača (ograničeno)
    upcoming_matches = total_upcoming_matches[:limit]
    
    matches_data = []
    
    for match in upcoming_matches:
        # Dohvati protivnički klub
        opponent_club_id = match.away_club_id if match.home_club_id == player.club_id else match.home_club_id
        opponent_club = session.get(Club, opponent_club_id)
        
        # Dohvati kolo
        gameweek = session.get(Gameweek, match.gameweek_id) if match.gameweek_id else None
        
        # Odredi da li je igrač igra kod kuće ili u gostima
        is_home = match.home_club_id == player.club_id
        
        matches_data.append({
            "match_id": match.id,
            "date": match.date,
            "gameweek": gameweek.number if gameweek else None,
            "opponent": opponent_club.name if opponent_club else "Unknown",
            "opponent_id": opponent_club_id,
            "is_home": is_home,
            "stadium": match.stadium,
            "referee": match.referee
        })
    
    return {
        "player_id": player_id,
        "player_name": player.name,
        "club_name": club.name,
        "upcoming_matches": matches_data,
        "total_matches": len(matches_data),
        "has_more_upcoming": len(total_upcoming_matches) > limit
    } 