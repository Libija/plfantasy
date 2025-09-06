from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session, select
from database import get_session
from schemas.fantasy_team_schema import FantasyTeamCreate, FantasyTeamUpdate, FantasyTeamResponse
from services.fantasy_team_service import (
    create_fantasy_team_service, 
    get_fantasy_team_service,
    get_user_fantasy_teams_service,
    update_fantasy_team_service,
    delete_fantasy_team_service,
    list_fantasy_teams_service,
    get_transfers_data_service,
    save_transfers_service,
    get_team_current_gameweek_points_service
)
from typing import List
from services.gameweek_team_service import GameweekTeamService
from models.gameweek_team_model import GameweekTeam
from models.user_model import User
from models.fantasyteam_model import FantasyTeam

router = APIRouter(prefix="/admin/fantasy", tags=["fantasy"])

# Javni endpointi za fantasy
public_router = APIRouter(prefix="/fantasy", tags=["public-fantasy"])

@public_router.get("/teams/user/{user_id}", response_model=List[FantasyTeamResponse])
def get_user_fantasy_teams(user_id: int, session: Session = Depends(get_session)):
    """Dohvata fantasy timove za određenog korisnika"""
    return get_user_fantasy_teams_service(session, user_id)

@public_router.get("/teams/{fantasy_team_id}", response_model=FantasyTeamResponse)
def get_fantasy_team(fantasy_team_id: int, session: Session = Depends(get_session)):
    """Dohvata fantasy tim po ID-u"""
    return get_fantasy_team_service(session, fantasy_team_id)

@public_router.post("/teams", response_model=FantasyTeamResponse, status_code=status.HTTP_201_CREATED)
def create_fantasy_team(data: FantasyTeamCreate, session: Session = Depends(get_session)):
    """Kreira novi fantasy tim"""
    return create_fantasy_team_service(session, data)

@public_router.put("/teams/{fantasy_team_id}", response_model=FantasyTeamResponse)
def update_fantasy_team(fantasy_team_id: int, data: FantasyTeamUpdate, session: Session = Depends(get_session)):
    """Ažurira fantasy tim"""
    return update_fantasy_team_service(session, fantasy_team_id, data)

@public_router.delete("/teams/{fantasy_team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fantasy_team(fantasy_team_id: int, session: Session = Depends(get_session)):
    """Briše fantasy tim"""
    delete_fantasy_team_service(session, fantasy_team_id)
    return None

# Transfer endpoints
@public_router.get("/transfers/{user_id}")
def get_transfers_data(user_id: int, session: Session = Depends(get_session)):
    """Dohvata podatke za transfers stranicu - tim, igrače, transfer window status, itd."""
    return get_transfers_data_service(session, user_id)

@public_router.post("/transfers/{user_id}")
def save_transfers(user_id: int, transfer_data: dict, session: Session = Depends(get_session)):
    """Sprema draft ili transfere za korisnika"""
    return save_transfers_service(session, user_id, transfer_data)

@public_router.get("/team/{fantasy_team_id}/gameweek/current")
def get_team_current_gameweek_points(fantasy_team_id: int, session: Session = Depends(get_session)):
    """Dohvata fantasy poene za tim u trenutnom kolu (IN_PROGRESS)"""
    return get_team_current_gameweek_points_service(session, fantasy_team_id)

@public_router.get("/results/{user_id}")
def get_user_fantasy_results(user_id: int, session: Session = Depends(get_session)):
    """Dohvata sve snapshotove i rezultate za korisnika (za dashboard)"""
    service = GameweekTeamService(session)
    return service.get_user_results(user_id)

@public_router.get("/leaderboard")
def get_fantasy_leaderboard(session: Session = Depends(get_session)):
    """Vraća globalni poredak korisnika po ukupnim bodovima (za dashboard)"""
    # Suma svih bodova po user_id
    statement = select(GameweekTeam.user_id, User.username, User.email).join(User, User.id == GameweekTeam.user_id)
    teams = session.exec(statement).all()
    # Suma bodova po user_id
    leaderboard = {}
    for user_id, username, email in teams:
        if user_id not in leaderboard:
            leaderboard[user_id] = {"user_id": user_id, "username": username, "email": email, "total_points": 0}
        # Dohvati sve timove za usera
        user_teams = session.exec(select(GameweekTeam).where(GameweekTeam.user_id == user_id)).all()
        leaderboard[user_id]["total_points"] = sum(t.total_points for t in user_teams)
    # Sortiraj po bodovima silazno
    sorted_leaderboard = sorted(leaderboard.values(), key=lambda x: x["total_points"], reverse=True)
    # Dodaj rank
    for idx, entry in enumerate(sorted_leaderboard, 1):
        entry["rank"] = idx
    return sorted_leaderboard

@public_router.get("/favorite-clubs-stats")
def get_favorite_clubs_stats(session: Session = Depends(get_session)):
    """Vraća statistike o omiljenim klubovima fantasy timova"""
    from models.club_model import Club
    
    # Dohvati sve fantasy timove sa omiljenim klubovima
    statement = select(FantasyTeam.favorite_club_id, Club.name).join(Club, Club.id == FantasyTeam.favorite_club_id, isouter=True)
    teams = session.exec(statement).all()
    
    # Broj ukupnih timova
    total_teams = len(teams)
    
    if total_teams == 0:
        return {
            "total_teams": 0,
            "stats": []
        }
    
    # Grupiranje po omiljenim klubovima
    club_stats = {}
    league_fans = 0  # Fanovi cijele lige (favorite_club_id = null)
    
    for favorite_club_id, club_name in teams:
        if favorite_club_id is None:
            league_fans += 1
        else:
            if club_name not in club_stats:
                club_stats[club_name] = 0
            club_stats[club_name] += 1
    
    # Sortiraj klubove po broju fanova
    sorted_clubs = sorted(club_stats.items(), key=lambda x: x[1], reverse=True)
    
    # Izračunaj postotke
    stats = []
    
    # Dodaj fanove cijele lige
    if league_fans > 0:
        stats.append({
            "club_name": "🏆 Fan cijele lige",
            "count": league_fans,
            "percentage": round((league_fans / total_teams) * 100, 1)
        })
    
    # Dodaj ostale klubove
    for club_name, count in sorted_clubs:
        stats.append({
            "club_name": club_name,
            "count": count,
            "percentage": round((count / total_teams) * 100, 1)
        })
    
    return {
        "total_teams": total_teams,
        "stats": stats
    }

# Admin endpointi
@router.get("/teams", response_model=List[FantasyTeamResponse])
def list_fantasy_teams(session: Session = Depends(get_session)):
    """Dohvata sve fantasy timove (admin)"""
    return list_fantasy_teams_service(session) 