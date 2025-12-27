from sqlmodel import Session, select
from models.fantasyteam_model import FantasyTeam
from models.fantasyteamplayer import FantasyTeamPlayer, PlayerRole
from models.player_model import Player
from models.club_model import Club
from models.transfer_log_model import TransferLog, TransferType
from models.gameweek_model import Gameweek
from models.playerfantasypoints_model import PlayerFantasyPoints
from models.match_model import Match
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
        # Proveri status enum vrednost
        if gw.status.value == "in_progress":
            is_window_open = False
            break
    
    # Transfer window je otvoren kada nema kola koja su IN_PROGRESS
    
    # Sledeće kolo je ono sa najmanjim brojem koje je SCHEDULED
    # Ako nema SCHEDULED kola, uzmi prvo kolo koje nije COMPLETED
    next_gameweek = None
    scheduled_gameweeks = [gw for gw in gameweeks if gw.status.value == "scheduled"]
    if scheduled_gameweeks:
        next_gameweek = min(scheduled_gameweeks, key=lambda x: x.number)
    else:
        # Ako nema SCHEDULED kola, uzmi prvo kolo koje nije COMPLETED
        non_completed_gameweeks = [gw for gw in gameweeks if gw.status.value != "completed"]
        if non_completed_gameweeks:
            next_gameweek = min(non_completed_gameweeks, key=lambda x: x.number)
    
    print(f"DEBUG get_transfers_data: Broj kola u bazi: {len(gameweeks)}")
    print(f"DEBUG get_transfers_data: Sva kola: {[(gw.number, gw.status.value) for gw in gameweeks]}")
    print(f"DEBUG get_transfers_data: Scheduled kola: {[gw.number for gw in scheduled_gameweeks]}")
    non_completed_gameweeks = [gw for gw in gameweeks if gw.status.value != "completed"]
    print(f"DEBUG get_transfers_data: Non-completed kola: {[gw.number for gw in non_completed_gameweeks]}")
    print(f"DEBUG get_transfers_data: Next gameweek: {next_gameweek.number if next_gameweek else 'None'}")
    
    # Dohvati broj transfera za trenutno kolo (IN_PROGRESS) ili naredno kolo
    transfers_this_week = 0
    transfer_repo = TransferLogRepository(session)
    
    # Prvo provjeri da li postoji trenutno kolo (IN_PROGRESS)
    current_gameweek = None
    for gw in gameweeks:
        if gw.status.value == "in_progress":
            current_gameweek = gw
            break
    
    if current_gameweek and fantasy_team.id is not None:
        # Ako postoji trenutno kolo, dohvati transfer za njega
        transfers_this_week = transfer_repo.get_transfer_count_by_gameweek(
            fantasy_team.id, current_gameweek.number
        )
        print(f"DEBUG: Trenutno kolo {current_gameweek.number} (IN_PROGRESS) - transferi: {transfers_this_week}")
    elif next_gameweek and fantasy_team.id is not None:
        # Ako nema trenutnog kola, dohvati transfer za naredno kolo
        transfers_this_week = transfer_repo.get_transfer_count_by_gameweek(
            fantasy_team.id, next_gameweek.number
        )
        print(f"DEBUG: Naredno kolo {next_gameweek.number} - transferi: {transfers_this_week}")
    else:
        print(f"DEBUG: Nema trenutnog ili narednog kola za transfer")
    
    # Izračunaj besplatne transfere i penal
    free_transfers = 3
    remaining_free_transfers = max(0, free_transfers - transfers_this_week)
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
            "club_logo": club.logo_url if club else None,
            "club_primary_color": club.primary_color if club else None,
            "club_secondary_color": club.secondary_color if club else None,
            "price": player.price if player else 0,
            "points": 0,  # TODO: Dohvati poene iz PlayerFantasyPoints
            "role": tp.role,
            "formation_position": tp.formation_position,
            "squad_number": tp.squad_number,
            "is_captain": tp.is_captain,
            "is_vice_captain": tp.is_vice_captain
        })
        
        # Debug log za logo - samo prvi igrač
        if len(team_players_data) == 1:
            print(f"LOGO: {player.name if player else 'Unknown'} - {club.logo_url if club else 'NEMA KLUB'}")
    
    # Pripremi podatke o svim igračima
    all_players_data = []
    for player in all_players:
        club = session.get(Club, player.club_id)
        
        # Dohvati ukupne fantasy poene igrača
        total_points = 0
        player_fantasy_points = session.exec(
            select(PlayerFantasyPoints).where(PlayerFantasyPoints.player_id == player.id)
        ).all()
        
        for pfp in player_fantasy_points:
            total_points += pfp.points
        
        all_players_data.append({
            "id": player.id,
            "name": player.name,
            "position": player.position,
            "club_name": club.name if club else "",
            "club_id": player.club_id,
            "club_logo": club.logo_url if club else None,
            "club_primary_color": club.primary_color if club else None,
            "club_secondary_color": club.secondary_color if club else None,
            "price": player.price,
            "points": total_points,
            "shirt_number": player.shirt_number,
            "nationality": player.nationality
        })
        
        # Debug log za logo u all_players - samo prvi igrač
        if len(all_players_data) == 1:
            print(f"ALL_PLAYERS: {player.name} - {club.logo_url if club else 'NEMA KLUB'}")
    
    # Grupiši i sortiraj igrače po pozicijama (po cijeni opadajuće)
    players_by_position = {
        "golmani": sorted([p for p in all_players_data if p["position"] == "GK"], key=lambda x: x["price"], reverse=True),
        "odbrana": sorted([p for p in all_players_data if p["position"] == "DEF"], key=lambda x: x["price"], reverse=True),
        "veznjaci": sorted([p for p in all_players_data if p["position"] == "MID"], key=lambda x: x["price"], reverse=True),
        "napadaci": sorted([p for p in all_players_data if p["position"] == "FWD"], key=lambda x: x["price"], reverse=True)
    }
    
    transfer_window_data = {
        "is_open": is_window_open,
        "next_gameweek": next_gameweek.number if next_gameweek else None,
        "next_gameweek_id": next_gameweek.id if next_gameweek else None,
        "next_gameweek_name": f"Kolo {next_gameweek.number}" if next_gameweek else None
    }
    
    print(f"DEBUG get_transfers_data: Transfer window data: {transfer_window_data}")
    print(f"DEBUG get_transfers_data: Broj igrača u timu: {len(team_players)}")
    print(f"DEBUG get_transfers_data: is_draft_mode: {len(team_players) == 0}")
    
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
        "transfer_window": transfer_window_data,
        "transfers_info": {
            "transfers_this_week": transfers_this_week,
            "free_transfers": free_transfers,
            "remaining_free_transfers": remaining_free_transfers,
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
    print(f"DEBUG save_transfers: Received is_draft_mode: {is_draft_mode}")
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
        # Dohvati sledeće kolo za transfer log
        gameweeks = session.exec(select(Gameweek)).all()
        next_gameweek = None
        scheduled_gameweeks = [gw for gw in gameweeks if gw.status.value == "scheduled"]
        if scheduled_gameweeks:
            next_gameweek = min(scheduled_gameweeks, key=lambda x: x.number)
        else:
            # Ako nema SCHEDULED kola, uzmi prvo kolo koje nije COMPLETED
            non_completed_gameweeks = [gw for gw in gameweeks if gw.status.value != "completed"]
            if non_completed_gameweeks:
                next_gameweek = min(non_completed_gameweeks, key=lambda x: x.number)
        
        # Debug informacije
        print(f"DEBUG: Broj kola u bazi: {len(gameweeks)}")
        print(f"DEBUG: Sva kola: {[(gw.number, gw.status.value) for gw in gameweeks]}")
        print(f"DEBUG: Scheduled kola: {[gw.number for gw in scheduled_gameweeks]}")
        non_completed_gameweeks = [gw for gw in gameweeks if gw.status.value != "completed"]
        print(f"DEBUG: Non-completed kola: {[gw.number for gw in non_completed_gameweeks]}")
        print(f"DEBUG: Next gameweek: {next_gameweek.number if next_gameweek else 'None'}")
        print(f"DEBUG: Is draft mode: {is_draft_mode}")
        
        # Obriši postojeće igrače u timu
        existing_players = session.exec(
            select(FantasyTeamPlayer).where(FantasyTeamPlayer.fantasy_team_id == fantasy_team.id)
        ).all()
        
        # Za transfere (ne draft), beleži promene u transfer log
        print(f"DEBUG: Proveravam transfer log - is_draft_mode={is_draft_mode}, next_gameweek={next_gameweek}")
        if not is_draft_mode and next_gameweek:
            print(f"DEBUG: Beleženje transfera za kolo {next_gameweek.number}")
            # Kreiraj mapu postojećih igrača po poziciji
            existing_players_map = {}
            for player in existing_players:
                existing_players_map[player.formation_position] = player.player_id
            
            print(f"DEBUG: Broj postojećih igrača: {len(existing_players)}")
            print(f"DEBUG: Postojeći igrači: {existing_players_map}")
            print(f"DEBUG: Broj novih igrača: {len([p for p in selected_players.values() if p])}")
            
            # Broj transfera koji će se napraviti
            transfer_count = 0
            
            # Uporedi sa novim igračima i beleži transfere
            for position, player_data in selected_players.items():
                if player_data:
                    new_player_id = player_data["id"]
                    old_player_id = existing_players_map.get(position)
                    
                    print(f"DEBUG: Pozicija {position}: stari={old_player_id}, novi={new_player_id}")
                    
                    if old_player_id and old_player_id != new_player_id:
                        print(f"DEBUG: TRANSFER DETEKTIRAN na poziciji {position}!")
                    else:
                        print(f"DEBUG: Nema transfera na poziciji {position} (stari={old_player_id}, novi={new_player_id})")
                    
                    if old_player_id and old_player_id != new_player_id:
                        # Transfer je napravljen
                        transfer_count += 1
                        print(f"DEBUG: Transfer napravljen na poziciji {position}")
                        old_player = session.get(Player, old_player_id)
                        new_player = session.get(Player, new_player_id)
                        
                        if old_player and new_player:
                            # Beleži transfer OUT
                            transfer_out = TransferLog(
                                fantasy_team_id=fantasy_team.id,
                                player_out_id=old_player_id,
                                transfer_type=TransferType.OUT,
                                gameweek=next_gameweek.number,
                                cost=0,  # Besplatan transfer
                                budget_before=fantasy_team.budget,
                                budget_after=fantasy_team.budget
                            )
                            session.add(transfer_out)
                            
                            # Beleži transfer IN
                            transfer_in = TransferLog(
                                fantasy_team_id=fantasy_team.id,
                                player_in_id=new_player_id,
                                transfer_type=TransferType.IN,
                                gameweek=next_gameweek.number,
                                cost=0,  # Besplatan transfer
                                budget_before=fantasy_team.budget,
                                budget_after=fantasy_team.budget
                            )
                            session.add(transfer_in)
                            print(f"DEBUG: Transfer log zapisi dodani za {old_player.name} -> {new_player.name}")
            
            # Ako su napravljeni transferi, dodaj informaciju u response
            if transfer_count > 0:
                print(f"Napravljeno {transfer_count} transfera za tim {fantasy_team.id} u kolu {next_gameweek.number}")
            else:
                print("DEBUG: Nema transfera za beleženje")
        else:
            print(f"DEBUG: Ne beleži se transfer log - draft_mode={is_draft_mode}, next_gameweek={next_gameweek}")
        
        for player in existing_players:
            session.delete(player)
        
        # Dodaj nove igrače
        squad_number = 1
        for position, player_data in selected_players.items():
            if player_data:
                is_captain = player_data["id"] == captain_id
                is_vice_captain = player_data["id"] == vice_captain_id
                
                # Odredi role na osnovu pozicije
                role = PlayerRole.BENCH if "_BENCH" in position else PlayerRole.REGULAR
                
                team_player = FantasyTeamPlayer(
                    fantasy_team_id=fantasy_team.id,
                    player_id=player_data["id"],
                    role=role,
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
        
        response_data = {
            "message": "Tim uspješno ažuriran",
            "fantasy_team_id": fantasy_team.id,
            "total_cost": total_cost,
            "remaining_budget": fantasy_team.budget
        }
        
        # Dodaj informaciju o transferima ako nije draft mode
        if not is_draft_mode and next_gameweek:
            response_data["transfers_made"] = transfer_count
            response_data["next_gameweek"] = next_gameweek.number
        
        return response_data
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Greška pri spremanju: {str(e)}")

def get_team_current_gameweek_points_service(session: Session, fantasy_team_id: int) -> Dict[str, Any]:
    """Dohvata fantasy poene za tim u trenutnom kolu (IN_PROGRESS).
    Napomena: Bodovi igrača sa klupe (formation_position sadrži '_BENCH') se NE računaju u total points."""
    
    print(f"DEBUG get_team_current_gameweek_points: Tražim kolo za tim {fantasy_team_id}")
    
    # Dohvati sva kola da vidimo šta ima u bazi
    all_gameweeks = session.exec(select(Gameweek)).all()
    print(f"DEBUG get_team_current_gameweek_points: Sva kola u bazi: {[(gw.number, gw.status) for gw in all_gameweeks]}")
    
    # Pronađi trenutno kolo (IN_PROGRESS)
    current_gameweek = session.exec(
        select(Gameweek).where(Gameweek.status == "in_progress")
    ).first()
    
    print(f"DEBUG get_team_current_gameweek_points: Trenutno kolo: {current_gameweek.number if current_gameweek else 'None'}")
    
    if not current_gameweek:
        return {
            "error": "Nema kola u toku",
            "current_gameweek": None,
            "players": []
        }
    
    # Dohvati igrače u timu
    team_players = session.exec(
        select(FantasyTeamPlayer).where(FantasyTeamPlayer.fantasy_team_id == fantasy_team_id)
    ).all()
    
    # Provjeri da li je kapiten igrao (ima minute > 0) - jednom za sve igrače
    captain_id = None
    captain_played = True
    for tp in team_players:
        if tp.is_captain:
            captain_id = tp.player_id
            break
    
    if captain_id and current_gameweek:
        from services.gameweek_team_service import GameweekTeamService
        team_service = GameweekTeamService(session)
        captain_minutes = team_service._calculate_player_minutes_for_gameweek(captain_id, current_gameweek.id)
        captain_played = captain_minutes > 0
    
    players_with_points = []
    
    for team_player in team_players:
        player = session.get(Player, team_player.player_id)
        if not player:
            continue
            
        club = session.get(Club, player.club_id)
        
        # Dohvati fantasy poene za ovog igrača u trenutnom kolu
        # Prvo pronađi sve mečeve u trenutnom kolu
        matches_in_gameweek = session.exec(
            select(Match).where(Match.gameweek_id == current_gameweek.id)
        ).all()
        
        print(f"DEBUG get_team_current_gameweek_points: Igrač {player.name} - mečeva u kolu: {len(matches_in_gameweek)}")
        
        total_points = 0
        
        # Za svaki meč u kolu, pronađi poene igrača
        for match in matches_in_gameweek:
            # Provjeri da li je igrač igrao u ovom meču (provjeri klub)
            if match.home_club_id == player.club_id or match.away_club_id == player.club_id:
                print(f"DEBUG get_team_current_gameweek_points: Igrač {player.name} igra u meču {match.id}")
                # Dohvati fantasy poene za ovog igrača u ovom meču
                fantasy_points = session.exec(
                    select(PlayerFantasyPoints).where(
                        PlayerFantasyPoints.player_id == player.id,
                        PlayerFantasyPoints.match_id == match.id
                    )
                ).first()
                
                if fantasy_points:
                    print(f"DEBUG get_team_current_gameweek_points: Igrač {player.name} ima {fantasy_points.points} poena u meču {match.id}")
                    total_points += fantasy_points.points
                else:
                    print(f"DEBUG get_team_current_gameweek_points: Igrač {player.name} nema poena u meču {match.id}")
        
        print(f"DEBUG get_team_current_gameweek_points: Igrač {player.name} - ukupno poena: {total_points}")
        
        # Igrači sa klupe ne doprinose bodovima tima
        is_bench = "_BENCH" in (team_player.formation_position or "")
        
        # Izračunaj poene sa bonusom
        if team_player.is_captain:
            if captain_played:
                final_points = total_points * 2  # Kapiten igrao → ×2
            else:
                final_points = total_points  # Kapiten nije igrao → ×1
        elif team_player.is_vice_captain:
            if captain_played:
                final_points = total_points  # Kapiten igrao → vice-kapiten ×1
            else:
                final_points = total_points * 2  # Kapiten nije igrao → vice-kapiten ×2
        else:
            final_points = total_points  # Ostali ×1
        
        players_with_points.append({
            "player_id": player.id,
            "player_name": player.name,
            "position": player.position,
            "club_name": club.name if club else "",
            "formation_position": team_player.formation_position,
            "is_captain": team_player.is_captain,
            "is_vice_captain": team_player.is_vice_captain,
            "is_bench": is_bench,
            "points": total_points,
            "final_points": final_points
        })
    
    # Računaj bodove samo za igrače iz prvih 11 (bez klupe)
    total_points_sum = sum(player["final_points"] for player in players_with_points if not player["is_bench"])
    bench_points_sum = sum(player["final_points"] for player in players_with_points if player["is_bench"])
    
    print(f"DEBUG get_team_current_gameweek_points: Ukupno poena tima (sa bonusom): {total_points_sum}")
    print(f"DEBUG get_team_current_gameweek_points: Bodovi klupe (ne računaju se): {bench_points_sum}")
    print(f"DEBUG get_team_current_gameweek_points: Broj igrača sa poenima: {len(players_with_points)}")
    
    return {
        "current_gameweek": {
            "number": current_gameweek.number,
            "name": f"{current_gameweek.number}. kolo"
        },
        "players": players_with_points,
        "total_points": total_points_sum
    } 