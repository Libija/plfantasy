from fastapi import APIRouter, Depends, status, HTTPException, Query
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
    
    # Dodaj fanove cijele lige u listu za sortiranje
    all_clubs = []
    if league_fans > 0:
        all_clubs.append(("🏆 Fan cijele lige", league_fans))
    
    # Dodaj ostale klubove
    all_clubs.extend(sorted_clubs)
    
    # Sortiraj sve po broju fanova (silazno)
    all_clubs.sort(key=lambda x: x[1], reverse=True)
    
    # Kreiraj finalnu listu sa postocima
    for club_name, count in all_clubs:
        stats.append({
            "club_name": club_name,
            "count": count,
            "percentage": round((count / total_teams) * 100, 1)
        })
    
    return {
        "total_teams": total_teams,
        "stats": stats
    }

@public_router.get("/club-rank/{club_id}")
def get_club_rank(
    club_id: int,
    user_id: int = Query(..., description="ID korisnika"),
    session: Session = Depends(get_session)
):
    """Vraća rank korisnika u odnosu na fanove istog kluba"""
    from models.gameweek_team_model import GameweekTeam
    
    # Provjeri da li je club_id null (fan lige)
    if club_id == 0:  # 0 će biti koristeno za "fan lige"
        # Dohvati sve korisnike sa favorite_club_id = null
        statement = select(FantasyTeam).where(FantasyTeam.favorite_club_id.is_(None))
    else:
        # Dohvati sve korisnike sa favorite_club_id = club_id
        statement = select(FantasyTeam).where(FantasyTeam.favorite_club_id == club_id)
    
    fantasy_teams = list(session.exec(statement).all())
    fan_user_ids = [team.user_id for team in fantasy_teams]
    
    if not fan_user_ids:
        return {
            "club_id": club_id,
            "club_name": "Fan cijele lige" if club_id == 0 else None,
            "user_rank": None,
            "total_fans": 0,
            "user_points": 0,
            "top_5": []
        }
    
    # Dohvati naziv kluba (ako nije fan lige)
    club_name = None
    if club_id != 0:
        from models.club_model import Club
        club = session.get(Club, club_id)
        club_name = club.name if club else None
    
    # Za svakog fan-a, sumiraj bodove iz GameweekTeam
    fan_points = {}
    for fan_user_id in fan_user_ids:
        statement = select(GameweekTeam).where(GameweekTeam.user_id == fan_user_id)
        gameweek_teams = list(session.exec(statement).all())
        total_points = sum(gt.total_points for gt in gameweek_teams if gt.total_points)
        fan_points[fan_user_id] = total_points
    
    # Sortiraj po bodovima (silazno)
    sorted_fans = sorted(fan_points.items(), key=lambda x: x[1], reverse=True)
    
    # Pronađi rank korisnika
    user_rank = None
    user_points = fan_points.get(user_id, 0)
    for idx, (uid, points) in enumerate(sorted_fans, 1):
        if uid == user_id:
            user_rank = idx
            break
    
    # Dohvati top 5 fanova sa username-ima
    top_5 = []
    for idx, (uid, points) in enumerate(sorted_fans[:5], 1):
        user = session.get(User, uid)
        if user:
            top_5.append({
                "rank": idx,
                "username": user.username,
                "points": points
            })
    
    return {
        "club_id": club_id,
        "club_name": club_name or ("Fan cijele lige" if club_id == 0 else None),
        "user_rank": user_rank,
        "total_fans": len(sorted_fans),
        "user_points": user_points,
        "top_5": top_5
    }

# Admin endpointi
@router.get("/teams", response_model=List[FantasyTeamResponse])
def list_fantasy_teams(session: Session = Depends(get_session)):
    """Dohvata sve fantasy timove (admin)"""
    return list_fantasy_teams_service(session) 