from sqlmodel import Session, select
from models.transfer_window_model import TransferWindow, TransferWindowStatus
from models.transfer_log_model import TransferLog, TransferType
from models.fantasyteam_model import FantasyTeam
from models.player_model import Player
from models.gameweek_model import Gameweek, GameweekStatus
from repositories.transfer_window_repository import TransferWindowRepository
from repositories.transfer_log_repository import TransferLogRepository
from repositories.fantasy_team_repository import (
    get_fantasy_team_by_id, update_team_budget, add_player_to_team, 
    remove_player_from_team, check_player_in_team, get_team_players_count
)
from repositories.player_repository import get_player_by_id
from repositories.gameweek_repository import GameweekRepository
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta

class TransferService:
    def __init__(self, session: Session):
        self.session = session
        self.transfer_window_repo = TransferWindowRepository(session)
        self.transfer_log_repo = TransferLogRepository(session)

    def create_transfer_window(self, season: str) -> TransferWindow:
        """Kreira globalni transfer window za sezonu"""
        transfer_window = TransferWindow(
            season=season,
            status=TransferWindowStatus.CLOSED
        )
        return self.transfer_window_repo.create(transfer_window)

    def open_transfer_window(self, transfer_window_id: int) -> Optional[TransferWindow]:
        """Otvara transfer window"""
        return self.transfer_window_repo.update_status(transfer_window_id, TransferWindowStatus.OPEN)

    def close_transfer_window(self, transfer_window_id: int) -> Optional[TransferWindow]:
        """Zatvara transfer window"""
        return self.transfer_window_repo.update_status(transfer_window_id, TransferWindowStatus.CLOSED)

    def check_and_update_transfer_window_status(self, season: str = "2024/25") -> Dict[str, Any]:
        """
        Automatski provjeri i ažurira status transfer window-a na osnovu statusa kolja
        
        Logika:
        - Ako postoji kolo "u toku" → zatvori transfer window
        - Ako su sva kola "završena" ili "zakazana" → otvori transfer window
        """
        try:
            # Dohvati sva kola za sezonu
            gameweek_repo = GameweekRepository(self.session)
            gameweeks = gameweek_repo.get_all(season=season)
            
            if not gameweeks:
                return {
                    "success": False,
                    "message": "Nema kolja za ovu sezonu"
                }
            
            # Provjeri da li postoji kolo u toku
            gameweek_in_progress = None
            for gameweek in gameweeks:
                if gameweek.status == GameweekStatus.IN_PROGRESS:
                    gameweek_in_progress = gameweek
                    break
            
            # Dohvati trenutni transfer window
            current_transfer_window = self.transfer_window_repo.get_current_transfer_window(season)
            
            if gameweek_in_progress:
                # Postoji kolo u toku - zatvori transfer window
                if current_transfer_window and current_transfer_window.status == TransferWindowStatus.OPEN and current_transfer_window.id:
                    self.close_transfer_window(current_transfer_window.id)
                    return {
                        "success": True,
                        "action": "closed",
                        "message": f"Transfer window zatvoren jer je kolo {gameweek_in_progress.number} u toku",
                        "gameweek_in_progress": gameweek_in_progress.number
                    }
                else:
                    return {
                        "success": True,
                        "action": "already_closed",
                        "message": f"Transfer window već zatvoren jer je kolo {gameweek_in_progress.number} u toku",
                        "gameweek_in_progress": gameweek_in_progress.number
                    }
            else:
                # Nema kola u toku - otvori transfer window
                if not current_transfer_window:
                    # Kreiraj novi transfer window ako ne postoji
                    # Pronađi sljedeće kolo koje treba igrati
                    next_gameweek = None
                    for gameweek in gameweeks:
                        if gameweek.status == GameweekStatus.SCHEDULED:
                            next_gameweek = gameweek
                            break
                    
                    # Kreiraj globalni transfer window ako ne postoji
                    transfer_window = self.create_transfer_window(season)
                    if transfer_window and transfer_window.id:
                        self.open_transfer_window(transfer_window.id)
                    
                    return {
                        "success": True,
                        "action": "created_and_opened",
                        "message": "Transfer window kreiran i otvoren",
                        "next_gameweek": next_gameweek.number if next_gameweek else None
                    }
                elif current_transfer_window.status == TransferWindowStatus.CLOSED and current_transfer_window.id:
                    # Otvori postojeći transfer window
                    self.open_transfer_window(current_transfer_window.id)
                    return {
                        "success": True,
                        "action": "opened",
                        "message": "Transfer window otvoren",
                        "season": current_transfer_window.season
                    }
                else:
                    return {
                        "success": True,
                        "action": "already_open",
                        "message": "Transfer window već otvoren",
                        "season": current_transfer_window.season
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "message": f"Greška pri ažuriranju transfer window statusa: {str(e)}"
            }

    def is_transfer_window_open(self, season: str) -> bool:
        """Provjeri da li je transfer window otvoren"""
        # Provjeri da li je transfer window otvoren
        transfer_window = self.transfer_window_repo.get_by_season(season)
        if not transfer_window:
            return False
        
        # Jednostavna logika - provjeri samo status
        return transfer_window.status == TransferWindowStatus.OPEN

    def get_current_transfer_window(self, season: str) -> Optional[TransferWindow]:
        """Dohvati trenutni transfer window"""
        return self.transfer_window_repo.get_current_transfer_window(season)

    def get_transfer_windows_by_season(self, season: str) -> List[TransferWindow]:
        """Dohvati sve transfer window-e za određenu sezonu"""
        transfer_window = self.transfer_window_repo.get_by_season(season)
        return [transfer_window] if transfer_window else []

    def make_transfer(self, fantasy_team_id: int, player_in_id: int, player_out_id: int, 
                     gameweek: int, season: str = "2024/25") -> Dict[str, Any]:
        """
        Izvršava transfer između dva igrača
        
        Returns:
            Dict sa rezultatom transfera
        """
        # Provjeri da li je transfer window otvoren
        if not self.is_transfer_window_open(season):
            return {
                "success": False,
                "message": "Transfer window nije otvoren za ovo kolo"
            }

        # Dohvati fantasy tim
        fantasy_team = get_fantasy_team_by_id(self.session, fantasy_team_id)
        if not fantasy_team:
            return {
                "success": False,
                "message": "Fantasy tim nije pronađen"
            }

        # Dohvati igrače
        player_in = get_player_by_id(self.session, player_in_id)
        player_out = get_player_by_id(self.session, player_out_id)
        
        if not player_in or not player_out:
            return {
                "success": False,
                "message": "Igrač nije pronađen"
            }

        # Provjeri da li je igrač koji izlazi u timu
        if not check_player_in_team(self.session, fantasy_team_id, player_out_id):
            return {
                "success": False,
                "message": "Igrač koji izlazi nije u vašem timu"
            }

        # Provjeri da li je igrač koji ulazi već u timu
        if check_player_in_team(self.session, fantasy_team_id, player_in_id):
            return {
                "success": False,
                "message": "Igrač koji ulazi je već u vašem timu"
            }

        # Izračunaj trošak transfera
        transfer_cost = player_in.price - player_out.price
        
        # Provjeri broj transfera i dodaj penalizaciju
        transfer_count = self.transfer_log_repo.get_transfer_count_by_gameweek(fantasy_team_id, gameweek)
        free_transfers = 3
        
        if transfer_count >= free_transfers:
            # Dodaj penalizaciju od 4 boda za svaki dodatni transfer
            penalty_points = (transfer_count - free_transfers + 1) * 4
            transfer_cost += penalty_points
        
        # Provjeri budžet
        if fantasy_team.budget + transfer_cost < 0:
            return {
                "success": False,
                "message": "Nemate dovoljno budžeta za ovaj transfer"
            }

        try:
            # Spremi budžet prije transfera
            budget_before = fantasy_team.budget
            
            # Ažuriraj budžet
            new_budget = budget_before + transfer_cost
            update_team_budget(self.session, fantasy_team_id, new_budget)
            
            # Ukloni igrača koji izlazi
            # Prvo pronađi fantasy_team_player_id
            from sqlmodel import select
            from models.fantasyteamplayer import FantasyTeamPlayer
            
            statement = select(FantasyTeamPlayer).where(
                FantasyTeamPlayer.fantasy_team_id == fantasy_team_id,
                FantasyTeamPlayer.player_id == player_out_id
            )
            ftp_out = self.session.exec(statement).first()
            
            if ftp_out and ftp_out.id:
                remove_player_from_team(self.session, ftp_out.id)
            
            # Dodaj igrača koji ulazi
            # Pronađi sljedeći squad_number
            current_players = get_team_players_count(self.session, fantasy_team_id)
            squad_number = current_players + 1
            
            add_player_to_team(
                self.session, fantasy_team_id, player_in_id,
                formation_position="", squad_number=squad_number
            )
            
            # Kreiraj transfer log
            transfer_log = TransferLog(
                fantasy_team_id=fantasy_team_id,
                player_in_id=player_in_id,
                player_out_id=player_out_id,
                transfer_type=TransferType.IN,
                gameweek=gameweek,
                cost=transfer_cost,
                budget_before=budget_before,
                budget_after=new_budget
            )
            self.transfer_log_repo.create(transfer_log)
            
            return {
                "success": True,
                "message": f"Transfer uspješan: {player_out.name} → {player_in.name}",
                "cost": transfer_cost,
                "new_budget": new_budget
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Greška pri transferu: {str(e)}"
            }

    def get_transfer_history(self, fantasy_team_id: int) -> List[Dict[str, Any]]:
        """Dohvati povijest transfera za tim"""
        transfers = self.transfer_log_repo.get_by_fantasy_team(fantasy_team_id)
        
        history = []
        for transfer in transfers:
            player_in = get_player_by_id(self.session, transfer.player_in_id) if transfer.player_in_id else None
            player_out = get_player_by_id(self.session, transfer.player_out_id) if transfer.player_out_id else None
            
            history.append({
                "id": transfer.id,
                "player_in": player_in.name if player_in else None,
                "player_out": player_out.name if player_out else None,
                "gameweek": transfer.gameweek,
                "cost": transfer.cost,
                "budget_before": transfer.budget_before,
                "budget_after": transfer.budget_after,
                "created_at": transfer.created_at
            })
        
        return history

    def get_transfer_stats(self, fantasy_team_id: int, gameweek: int) -> Dict[str, Any]:
        """Dohvati statistike transfera za određeno kolo"""
        transfer_count = self.transfer_log_repo.get_transfer_count_by_gameweek(fantasy_team_id, gameweek)
        total_cost = self.transfer_log_repo.get_total_transfer_cost_by_gameweek(fantasy_team_id, gameweek)
        
        return {
            "transfers_used": transfer_count,
            "transfers_remaining": max(0, 3 - transfer_count),
            "total_cost": total_cost
        } 