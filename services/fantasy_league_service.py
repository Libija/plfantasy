from sqlmodel import Session, select
from models.fantasy_league_model import FantasyLeague
from models.fantasy_league_member_model import FantasyLeagueMember
from models.gameweek_team_model import GameweekTeam
from models.user_model import User
from models.fantasyteam_model import FantasyTeam
from repositories.fantasy_league_repository import (
    create_fantasy_league,
    get_fantasy_league_by_id,
    get_fantasy_league_by_code,
    get_fantasy_leagues_by_user,
    get_fantasy_league_members,
    get_fantasy_league_member,
    add_league_member,
    remove_league_member,
    get_league_member_count
)
from schemas.fantasy_league_schema import (
    FantasyLeagueCreate,
    FantasyLeagueResponse,
    FantasyLeagueJoinRequest,
    FantasyLeagueRankingEntry,
    FantasyLeagueRankingResponse
)
from fastapi import HTTPException
from typing import List, Dict, Any, Optional
import string
import random

def generate_league_code(session: Session) -> str:
    """Generiše jedinstveni 6-karaktera kod (slova i brojevi)"""
    characters = string.ascii_uppercase + string.digits
    max_attempts = 100
    
    for _ in range(max_attempts):
        code = ''.join(random.choice(characters) for _ in range(6))
        existing_league = get_fantasy_league_by_code(session, code)
        if not existing_league:
            return code
    
    raise HTTPException(
        status_code=500,
        detail="Neuspješno generisanje jedinstvenog koda lige. Pokušajte ponovo."
    )

def create_fantasy_league_service(session: Session, data: FantasyLeagueCreate) -> FantasyLeagueResponse:
    """Kreira novu fantasy ligu"""
    # Generiši jedinstveni kod
    code = generate_league_code(session)
    
    # Kreiraj ligu
    league = FantasyLeague(
        name=data.name,
        code=code,
        creator_id=data.creator_id
    )
    
    league = create_fantasy_league(session, league)
    
    # Automatski dodaj kreatora kao člana
    creator_member = FantasyLeagueMember(
        league_id=league.id,
        user_id=data.creator_id
    )
    add_league_member(session, creator_member)
    
    # Dohvati kreatora za username
    creator = session.get(User, data.creator_id)
    creator_username = creator.username if creator else None
    
    member_count = get_league_member_count(session, league.id)
    
    response = FantasyLeagueResponse(
        id=league.id,
        name=league.name,
        code=league.code,
        creator_id=league.creator_id,
        creator_username=creator_username,
        created_at=league.created_at,
        member_count=member_count
    )
    
    return response

def join_fantasy_league_service(session: Session, user_id: int, data: FantasyLeagueJoinRequest) -> FantasyLeagueResponse:
    """Pridružuje korisnika ligi preko koda"""
    # Pronađi ligu po kodu
    league = get_fantasy_league_by_code(session, data.code.upper())
    if not league:
        raise HTTPException(status_code=404, detail="Liga sa datim kodom nije pronađena")
    
    # Provjeri da li je korisnik već član
    existing_member = get_fantasy_league_member(session, league.id, user_id)
    if existing_member:
        raise HTTPException(status_code=400, detail="Već ste član ove lige")
    
    # Dodaj korisnika u ligu
    member = FantasyLeagueMember(
        league_id=league.id,
        user_id=user_id
    )
    add_league_member(session, member)
    
    # Dohvati kreatora za username
    creator = session.get(User, league.creator_id)
    creator_username = creator.username if creator else None
    
    member_count = get_league_member_count(session, league.id)
    
    response = FantasyLeagueResponse(
        id=league.id,
        name=league.name,
        code=league.code,
        creator_id=league.creator_id,
        creator_username=creator_username,
        created_at=league.created_at,
        member_count=member_count
    )
    
    return response

def get_fantasy_league_service(session: Session, league_id: int) -> FantasyLeagueResponse:
    """Dohvata detalje lige"""
    league = get_fantasy_league_by_id(session, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="Liga nije pronađena")
    
    creator = session.get(User, league.creator_id)
    creator_username = creator.username if creator else None
    
    member_count = get_league_member_count(session, league.id)
    
    response = FantasyLeagueResponse(
        id=league.id,
        name=league.name,
        code=league.code,
        creator_id=league.creator_id,
        creator_username=creator_username,
        created_at=league.created_at,
        member_count=member_count
    )
    
    return response

def get_user_leagues_service(session: Session, user_id: int) -> List[FantasyLeagueResponse]:
    """Dohvata sve lige u kojima je korisnik član"""
    leagues = get_fantasy_leagues_by_user(session, user_id)
    
    result = []
    for league in leagues:
        creator = session.get(User, league.creator_id)
        creator_username = creator.username if creator else None
        member_count = get_league_member_count(session, league.id)
        
        result.append(FantasyLeagueResponse(
            id=league.id,
            name=league.name,
            code=league.code,
            creator_id=league.creator_id,
            creator_username=creator_username,
            created_at=league.created_at,
            member_count=member_count
        ))
    
    return result

def get_league_ranking_service(session: Session, league_id: int, current_user_id: Optional[int] = None) -> FantasyLeagueRankingResponse:
    """Dohvata ranking lige - suma svih GameweekTeam.total_points po korisniku"""
    # Provjeri da li liga postoji
    league = get_fantasy_league_by_id(session, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="Liga nije pronađena")
    
    # Dohvati sve članove lige
    members = get_fantasy_league_members(session, league_id)
    if not members:
        return FantasyLeagueRankingResponse(
            league_id=league.id,
            league_name=league.name,
            league_code=league.code,
            ranking=[],
            total_members=0
        )
    
    # Za svakog člana, sumiraj bodove iz svih GameweekTeam snapshot-a
    ranking_data = []
    
    for member in members:
        user = session.get(User, member.user_id)
        if not user:
            continue
        
        # Dohvati sve GameweekTeam snapshot-e za korisnika
        statement = select(GameweekTeam).where(GameweekTeam.user_id == member.user_id)
        gameweek_teams = list(session.exec(statement).all())
        
        # Sumiraj ukupne bodove
        total_points = sum(gt.total_points for gt in gameweek_teams if gt.total_points)
        
        # Dohvati zadnji snapshot za bodove prošle sedmice
        last_week_points = 0
        if gameweek_teams:
            # Sortiraj po gameweek_id desc i uzmi prvi
            sorted_teams = sorted(gameweek_teams, key=lambda x: x.gameweek_id, reverse=True)
            if sorted_teams:
                last_week_points = sorted_teams[0].total_points or 0
        
        # Dohvati naziv tima
        fantasy_team_statement = select(FantasyTeam).where(FantasyTeam.user_id == member.user_id)
        fantasy_team = session.exec(fantasy_team_statement).first()
        team_name = fantasy_team.name if fantasy_team else None
        
        ranking_data.append({
            "user_id": member.user_id,
            "username": user.username,
            "team_name": team_name,
            "total_points": total_points,
            "last_week_points": last_week_points,
            "is_me": current_user_id == member.user_id if current_user_id else False
        })
    
    # Sortiraj po ukupnim bodovima (silazno)
    ranking_data.sort(key=lambda x: x["total_points"], reverse=True)
    
    # Dodaj rank
    ranking_entries = []
    for idx, entry in enumerate(ranking_data, 1):
        ranking_entries.append(FantasyLeagueRankingEntry(
            rank=idx,
            user_id=entry["user_id"],
            username=entry["username"],
            team_name=entry["team_name"],
            total_points=entry["total_points"],
            last_week_points=entry["last_week_points"],
            is_me=entry["is_me"]
        ))
    
    return FantasyLeagueRankingResponse(
        league_id=league.id,
        league_name=league.name,
        league_code=league.code,
        ranking=ranking_entries,
        total_members=len(ranking_entries)
    )

def leave_fantasy_league_service(session: Session, league_id: int, user_id: int) -> Dict[str, Any]:
    """Uklanja korisnika iz lige"""
    league = get_fantasy_league_by_id(session, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="Liga nije pronađena")
    
    # Provjeri da li je korisnik član
    member = get_fantasy_league_member(session, league_id, user_id)
    if not member:
        raise HTTPException(status_code=400, detail="Niste član ove lige")
    
    # Ne dozvoli da kreator napusti ligu (ili dozvoli, ali to je design odluka)
    # Za sada dozvoljavamo
    
    # Ukloni člana
    success = remove_league_member(session, league_id, user_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Greška pri uklanjanju iz lige")
    
    return {"success": True, "message": "Uspješno ste napustili ligu"}

