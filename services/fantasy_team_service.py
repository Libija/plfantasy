from sqlmodel import Session, select
from models.fantasyteam_model import FantasyTeam
from models.fantasyteamplayer import FantasyTeamPlayer, PlayerRole
from models.player_model import Player
from models.club_model import Club
from models.transfer_log_model import TransferLog, TransferType
from models.gameweek_model import Gameweek
from repositories.fantasy_team_repository import (
    create_fantasy_team, 
    get_fantasy_team_by_id, 
    get_fantasy_teams_by_user_id,
    get_fantasy_team_by_user_and_name,
    update_fantasy_team,
    delete_fantasy_team,
    get_all_fantasy_teams
)
from repositories.transfer_log_repository import TransferLogRepository
from schemas.fantasy_team_schema import FantasyTeamCreate, FantasyTeamUpdate, FantasyTeamResponse
from fastapi import HTTPException
from typing import List, Dict, Any
from datetime import datetime

def create_fantasy_team_service(session: Session, data: FantasyTeamCreate) -> FantasyTeamResponse:
    """Kreira novi fantasy tim"""
    # Provjeri da li korisnik već ima tim sa istim nazivom
    existing_team = get_fantasy_team_by_user_and_name(session, data.user_id, data.name)
    if existing_team:
        raise HTTPException(
            status_code=400, 
            detail=f"Već imate tim sa nazivom '{data.name}'"
        )
    
    fantasy_team = FantasyTeam(
        user_id=data.user_id,
        name=data.name,
        favorite_club_id=data.favorite_club_id
    )
    
    fantasy_team = create_fantasy_team(session, fantasy_team)
    return FantasyTeamResponse.from_orm(fantasy_team)

def get_fantasy_team_service(session: Session, fantasy_team_id: int) -> FantasyTeamResponse:
    """Dohvata fantasy tim po ID-u"""
    fantasy_team = get_fantasy_team_by_id(session, fantasy_team_id)
    if not fantasy_team:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    return FantasyTeamResponse.from_orm(fantasy_team)

def get_user_fantasy_teams_service(session: Session, user_id: int) -> List[FantasyTeamResponse]:
    """Dohvata fantasy timove za određenog korisnika"""
    fantasy_teams = get_fantasy_teams_by_user_id(session, user_id)
    return [FantasyTeamResponse.from_orm(team) for team in fantasy_teams]

def update_fantasy_team_service(session: Session, fantasy_team_id: int, data: FantasyTeamUpdate) -> FantasyTeamResponse:
    """Ažurira fantasy tim"""
    fantasy_team = get_fantasy_team_by_id(session, fantasy_team_id)
    if not fantasy_team:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    
    # Provjeri da li korisnik već ima tim sa istim nazivom (ako se mijenja naziv)
    if data.name and data.name != fantasy_team.name:
        existing_team = get_fantasy_team_by_user_and_name(session, fantasy_team.user_id, data.name)
        if existing_team:
            raise HTTPException(
                status_code=400, 
                detail=f"Već imate tim sa nazivom '{data.name}'"
            )
    
    # Ažuriraj polja
    if data.name is not None:
        fantasy_team.name = data.name
    if data.favorite_club_id is not None:
        fantasy_team.favorite_club_id = data.favorite_club_id
    
    fantasy_team = update_fantasy_team(session, fantasy_team)
    return FantasyTeamResponse.from_orm(fantasy_team)

def delete_fantasy_team_service(session: Session, fantasy_team_id: int) -> bool:
    """Briše fantasy tim"""
    success = delete_fantasy_team(session, fantasy_team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    return True

def list_fantasy_teams_service(session: Session) -> List[FantasyTeamResponse]:
    """Dohvata sve fantasy timove"""
    fantasy_teams = get_all_fantasy_teams(session)
    return [FantasyTeamResponse.from_orm(team) for team in fantasy_teams]

def get_transfers_data_service(session: Session, user_id: int) -> Dict[str, Any]:
    """Dohvata sve podatke potrebne za transfers stranicu"""
    
    # Dohvati fantasy tim korisnika
    fantasy_teams = get_fantasy_teams_by_user_id(session, user_id)
    if not fantasy_teams:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    
    fantasy_team = fantasy_teams[0]  # Uzimamo prvi tim
    
    # Dohvati igrače u timu
    team_players = session.exec(
        select(FantasyTeamPlayer).where(FantasyTeamPlayer.fantasy_team_id == fantasy_team.id)
    ).all()
    
    # Dohvati sve igrače sa cenama i poenima
    all_players = session.exec(select(Player)).all()
    
    # Dohvati klubove
    clubs = session.exec(select(Club)).all()
    
    # Umesto transfer window logike, koristi gameweek logiku:
    gameweeks = session.exec(select(Gameweek)).all()
    is_window_open = True
    for gw in gameweeks:
        # Usporedi status neovisno o veličini slova
        if str(gw.status).lower() == "in_progress":
            is_window_open = False
            break
    # Sljedeće kolo je zakazano s najmanjim brojem
    next_gameweek = None
    zakazana_kola = [gw for gw in gameweeks if str(gw.status).lower() == "scheduled"]
    if zakazana_kola:
        next_gameweek = min(zakazana_kola, key=lambda x: x.number)
    
    # Dohvati broj transfera za naredno kolo (ako postoji)
    transfers_this_week = 0
    if next_gameweek and fantasy_team.id is not None:
        transfer_repo = TransferLogRepository(session)
        transfers_this_week = transfer_repo.get_transfer_count_by_gameweek(fantasy_team.id, next_gameweek.number)
    
    # Izračunaj besplatne transfere i penal
    free_transfers = 3
    penalty = max(0, transfers_this_week - free_transfers) * 4
    
    # Pripremi podatke o igračima u timu
    team_players_data = []
    for tp in team_players:
        player = session.get(Player, tp.player_id)
        club = session.get(Club, player.club_id) if player else None
        
        team_players_data.append({
            "id": tp.id,
            "player_id": tp.player_id,
            "player_name": player.name if player else "",
            "player_position": player.position if player else "",
            "club_name": club.name if club else "",
            "club_id": player.club_id if player else None,
            "price": player.price if player else 0,
            "points": 0,  # TODO: Dohvati poene iz PlayerFantasyPoints
            "role": tp.role,
            "formation_position": tp.formation_position,
            "squad_number": tp.squad_number,
            "is_captain": tp.is_captain,
            "is_vice_captain": tp.is_vice_captain
        })
    
    # Pripremi podatke o svim igračima
    all_players_data = []
    for player in all_players:
        club = session.get(Club, player.club_id)
        all_players_data.append({
            "id": player.id,
            "name": player.name,
            "position": player.position,
            "club_name": club.name if club else "",
            "club_id": player.club_id,
            "price": player.price,
            "points": 0,  # TODO: Dohvati poene iz PlayerFantasyPoints
            "shirt_number": player.shirt_number,
            "nationality": player.nationality
        })
    
    # Grupiši i sortiraj igrače po pozicijama (po cijeni opadajuće)
    players_by_position = {
        "golmani": sorted([p for p in all_players_data if p["position"] == "GK"], key=lambda x: x["price"], reverse=True),
        "odbrana": sorted([p for p in all_players_data if p["position"] == "DEF"], key=lambda x: x["price"], reverse=True),
        "veznjaci": sorted([p for p in all_players_data if p["position"] == "MID"], key=lambda x: x["price"], reverse=True),
        "napadaci": sorted([p for p in all_players_data if p["position"] == "FWD"], key=lambda x: x["price"], reverse=True)
    }
    
    return {
        "fantasy_team": {
            "id": fantasy_team.id,
            "name": fantasy_team.name,
            "budget": fantasy_team.budget,
            "formation": fantasy_team.formation,
            "total_points": fantasy_team.total_points,
            "favorite_club_id": fantasy_team.favorite_club_id
        },
        "team_players": team_players_data,
        "all_players": players_by_position,
        "transfer_window": {
            "is_open": is_window_open,
            "next_gameweek": next_gameweek.number if next_gameweek else None,
            "next_gameweek_id": next_gameweek.id if next_gameweek else None
        },
        "transfers_info": {
            "transfers_this_week": transfers_this_week,
            "free_transfers": free_transfers,
            "remaining_free_transfers": max(0, free_transfers - transfers_this_week),
            "penalty": penalty
        },
        "is_draft_mode": len(team_players) == 0
    }

def save_transfers_service(session: Session, user_id: int, transfer_data: dict) -> Dict[str, Any]:
    """Sprema draft ili transfere za korisnika"""
    
    # Dohvati fantasy tim
    fantasy_teams = get_fantasy_teams_by_user_id(session, user_id)
    if not fantasy_teams:
        raise HTTPException(status_code=404, detail="Fantasy tim nije pronađen")
    
    fantasy_team = fantasy_teams[0]
    
    # Proveri da li fantasy team ima ID
    if fantasy_team.id is None:
        raise HTTPException(status_code=500, detail="Fantasy tim nema validan ID")
    
    # Dohvati trenutni transfer window
    # current_transfer_window = session.exec(
    #     select(TransferWindow).where(TransferWindow.is_active == True)
    # ).first()
    
    is_draft_mode = transfer_data.get("is_draft_mode", False)
    selected_players = transfer_data.get("selected_players", {})
    formation = transfer_data.get("formation", "4-3-3")
    captain_id = transfer_data.get("captain_id")
    vice_captain_id = transfer_data.get("vice_captain_id")
    
    # Validacija
    # if not is_draft_mode and not current_transfer_window:
    #     raise HTTPException(status_code=400, detail="Transfer window nije otvoren")
    
    # Provjeri broj igrača
    total_players = sum(1 for player in selected_players.values() if player is not None)
    if total_players != 15:
        raise HTTPException(status_code=400, detail="Morate odabrati tačno 15 igrača")
    
    # Provjeri budžet
    total_cost = sum(player["price"] for player in selected_players.values() if player is not None)
    cost_difference = 0  # Inicijalizuj za transfere
    
    if is_draft_mode:
        # Za draft, proveri da li ukupan trošak ne prelazi 100
        if total_cost > 100.0:
            raise HTTPException(status_code=400, detail="Prekoračili ste budžet od 100M")
    else:
        # Za transfere, proveri da li imate dovoljno budžeta za razliku
        old_total_cost = 0
        # Dohvati postojeće igrače za računanje troška
        current_players = session.exec(
            select(FantasyTeamPlayer).where(FantasyTeamPlayer.fantasy_team_id == fantasy_team.id)
        ).all()
        
        for player in current_players:
            if player and player.player_id:
                player_obj = session.get(Player, player.player_id)
                if player_obj:
                    old_total_cost += player_obj.price
        
        cost_difference = total_cost - old_total_cost
        if cost_difference > fantasy_team.budget:
            raise HTTPException(status_code=400, detail=f"Prekoračili ste budžet. Potrebno: {cost_difference:.1f}M, dostupno: {fantasy_team.budget:.1f}M")
    
    # Provjeri ograničenje po klubovima (max 3 igrača iz istog kluba)
    club_counts = {}
    for player in selected_players.values():
        if player:
            club_id = player["club_id"]
            club_counts[club_id] = club_counts.get(club_id, 0) + 1
            if club_counts[club_id] > 3:
                raise HTTPException(status_code=400, detail=f"Možete imati maksimalno 3 igrača iz istog kluba")
    
    # Provjeri kapiten i vice-kapiten
    if captain_id and vice_captain_id and captain_id == vice_captain_id:
        raise HTTPException(status_code=400, detail="Kapiten i vice-kapiten ne mogu biti isti igrač")
    
    try:
        # Penal logika je sada isključena jer se transfer window i penal računaju dinamički
        # (možeš vratiti ako budeš želeo da penal upisuješ u log)
        # if not is_draft_mode and ...
        #     ...
        #     if transfers_this_week >= 3:
        #         ... penal log ...

        # Obriši postojeće igrače u timu
        existing_players = session.exec(
            select(FantasyTeamPlayer).where(FantasyTeamPlayer.fantasy_team_id == fantasy_team.id)
        ).all()
        
        for player in existing_players:
            session.delete(player)
        
        # Dodaj nove igrače
        squad_number = 1
        for position, player_data in selected_players.items():
            if player_data:
                is_captain = player_data["id"] == captain_id
                is_vice_captain = player_data["id"] == vice_captain_id
                
                team_player = FantasyTeamPlayer(
                    fantasy_team_id=fantasy_team.id,
                    player_id=player_data["id"],
                    role=PlayerRole.REGULAR,
                    formation_position=position,
                    squad_number=squad_number,
                    is_captain=is_captain,
                    is_vice_captain=is_vice_captain
                )
                session.add(team_player)
                squad_number += 1
        
        # Ažuriraj tim
        fantasy_team.formation = formation
        
        # Za draft mode, resetuj budžet na 100 - trošak
        # Za transfere, koristi trenutni budžet i oduzmi razliku
        if is_draft_mode:
            fantasy_team.budget = 100.0 - total_cost
        else:
            # Za transfere, koristi već izračunatu razliku
            fantasy_team.budget -= cost_difference
        
        session.add(fantasy_team)
        session.commit()
        
        return {
            "message": "Tim uspješno ažuriran",
            "fantasy_team_id": fantasy_team.id,
            "total_cost": total_cost,
            "remaining_budget": fantasy_team.budget
        }
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Greška pri spremanju: {str(e)}") 