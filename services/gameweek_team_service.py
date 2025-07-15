from sqlmodel import Session, select
from models.gameweek_team_model import GameweekTeam
from models.gameweek_player_model import GameweekPlayer
from models.fantasyteam_model import FantasyTeam
from models.fantasyteamplayer import FantasyTeamPlayer
from models.player_model import Player
from models.gameweek_model import Gameweek
from models.playerfantasypoints_model import PlayerFantasyPoints
from models.match_model import Match
from repositories.gameweek_team_repository import (
    create_gameweek_team, get_gameweek_team_by_id, get_user_gameweek_teams,
    get_user_gameweek_team, get_completed_gameweek_teams, create_gameweek_player,
    get_gameweek_team_players, get_gameweek_team_with_players
)
from repositories.fantasy_team_repository import get_fantasy_team_players
from typing import List, Optional, Dict, Any
from datetime import datetime
from database import engine

class GameweekTeamService:
    def __init__(self, session: Session):
        self.session = session
    
    def create_snapshots_for_completed_gameweek(self, gameweek_id: int) -> Dict[str, Any]:
        print("[DEBUG] === POZVANA create_snapshots_for_completed_gameweek ===")
        # Provjeri da li kolo postoji i da li je završeno
        gameweek_statement = select(Gameweek).where(Gameweek.id == gameweek_id)
        gameweek = self.session.exec(gameweek_statement).first()
        print(f"[DEBUG] gameweek_id: {gameweek_id}, gameweek: {gameweek}")
        
        if not gameweek:
            print("[DEBUG] Kolo nije pronađeno!")
            return {"success": False, "message": "Kolo nije pronađeno"}
        
        print(f"[DEBUG] STATUS U SNAPSHOT SERVISU: {gameweek.status} (type: {type(gameweek.status)})")
        status_str = getattr(gameweek.status, 'name', str(gameweek.status)).lower()
        print(f"[DEBUG] status_str (lower): {status_str}")
        if status_str != "completed":
            print(f"[DEBUG] Kolo nije završeno. Status: {status_str}")
            return {"success": False, "message": f"Kolo nije završeno. Status: {status_str}"}
        else:
            print("[DEBUG] === SNAPSHOT LOGIKA SE IZVRŠAVA ===")
        
        # Dohvati sve fantasy timove
        fantasy_teams_statement = select(FantasyTeam)
        fantasy_teams = list(self.session.exec(fantasy_teams_statement).all())
        print(f"[DEBUG] FANTASY TEAMS COUNT: {len(fantasy_teams)} | IDS: {[ft.id for ft in fantasy_teams]}")
        
        created_snapshots = 0
        errors = []
        for fantasy_team in fantasy_teams:
            try:
                print(f"[DEBUG] --- User {fantasy_team.user_id} ---")
                existing_snapshot = get_user_gameweek_team(self.session, fantasy_team.user_id, gameweek_id)
                print(f"[DEBUG] Postoji snapshot? {existing_snapshot}")
                if existing_snapshot:
                    print(f"[DEBUG] Preskačem user {fantasy_team.user_id} (već postoji snapshot)")
                    continue
                snapshot = self.create_team_snapshot(fantasy_team.user_id, gameweek_id, commit=False)
                print(f"[DEBUG] Kreiran snapshot: {snapshot}")
                if snapshot:
                    created_snapshots += 1
                else:
                    errors.append(f"Greška pri kreiranju snapshot-a za korisnika {fantasy_team.user_id}")
            except Exception as e:
                print(f"[DEBUG] Greška za korisnika {fantasy_team.user_id}: {str(e)}")
                errors.append(f"Greška za korisnika {fantasy_team.user_id}: {str(e)}")
        print(f"[DEBUG] SESSION DIRTY: {self.session.dirty}, NEW: {self.session.new}, DELETED: {self.session.deleted}")
        self.session.flush()
        print(f"[DEBUG] SESSION FLUSHED")
        self.session.commit()
        print(f"[DEBUG] SESSION COMMIT DONE")
        print(f"[DEBUG] === POVRATNA VRIJEDNOST: Kreirano {created_snapshots} snapshot-a, errors: {errors} ===")
        return {
            "success": True,
            "message": f"Kreirano {created_snapshots} snapshot-a za kolo {gameweek_id}",
            "created_snapshots": created_snapshots,
            "errors": errors
        }
    
    def create_team_snapshot(self, user_id: int, gameweek_id: int, commit: bool = True) -> Optional[GameweekTeam]:
        """Kreira snapshot tima za određeno kolo"""
        # Provjeri da li već postoji snapshot za ovo kolo
        existing_snapshot = get_user_gameweek_team(self.session, user_id, gameweek_id)
        if existing_snapshot:
            return existing_snapshot
        
        # Dohvati fantasy tim korisnika
        fantasy_team_statement = select(FantasyTeam).where(FantasyTeam.user_id == user_id)
        fantasy_team = self.session.exec(fantasy_team_statement).first()
        if not fantasy_team:
            return None
        
        # Dohvati igrače tima sa informacijama o kapitenima
        team_players_statement = select(FantasyTeamPlayer, Player).join(Player, Player.id == FantasyTeamPlayer.player_id).where(
            FantasyTeamPlayer.fantasy_team_id == fantasy_team.id
        )
        team_players_data = self.session.exec(team_players_statement).all()
        print(f"[DEBUG] team_players_data: {team_players_data}")
        # Pronađi kapiten i vice-kapiten
        captain_id = None
        vice_captain_id = None
        for ftp, player in team_players_data:
            if ftp.is_captain:
                captain_id = player.id
            elif ftp.is_vice_captain:
                vice_captain_id = player.id
        
        # Kreiraj gameweek tim
        gameweek_team = GameweekTeam(
            user_id=user_id,
            gameweek_id=gameweek_id,
            formation=fantasy_team.formation,
            captain_id=captain_id or 0,
            vice_captain_id=vice_captain_id or 0,
            total_points=0.0
        )
        
        created_team = create_gameweek_team(self.session, gameweek_team, commit=commit)
        self.session.flush()  # Osiguraj da team ima ID prije upisa igrača
        # Dodaj igrače u snapshot
        for ftp, player in team_players_data:
            print(f"[DEBUG] Dodajem igrača {player.id} ({player.name}) u snapshot tima {created_team.id}")
            if player.id is not None and created_team.id is not None:
                # Dohvati poene igrača za ovo kolo
                points = self._get_player_points_for_gameweek(player.id, gameweek_id)
                
                gameweek_player = GameweekPlayer(
                    gameweek_team_id=created_team.id,
                    player_id=player.id,
                    position=player.position,
                    is_bench=ftp.role == "BENCH",
                    points=points
                )
                create_gameweek_player(self.session, gameweek_player, commit=commit)
        
        # Izračunaj ukupne poene
        if created_team.id is not None:
            total_points = self._calculate_total_points(created_team.id, captain_id or 0, vice_captain_id or 0)
            created_team.total_points = total_points
            self.session.add(created_team)
            if commit:
                self.session.commit()
                self.session.refresh(created_team)
            else:
                self.session.flush()
        
        return created_team
    
    def get_user_results(self, user_id: int) -> List[Dict[str, Any]]:
        """Dohvata rezultate korisnika iz svih završenih kola"""
        completed_teams = get_completed_gameweek_teams(self.session, user_id)
        results = []
        
        for team in completed_teams:
            # Dohvati informacije o kolu
            gameweek_statement = select(Gameweek).where(Gameweek.id == team.gameweek_id)
            gameweek = self.session.exec(gameweek_statement).first()
            
            # Dohvati igrače tima
            if team.id is not None:
                players = get_gameweek_team_players(self.session, team.id)
            else:
                players = []
            
            # Dohvati informacije o igračima
            players_with_details = []
            for player in players:
                player_statement = select(Player).where(Player.id == player.player_id)
                player_details = self.session.exec(player_statement).first()
                
                players_with_details.append({
                    "id": player.id,
                    "player_id": player.player_id,
                    "player_name": player_details.name if player_details else "Unknown",
                    "position": player.position,
                    "is_bench": player.is_bench,
                    "points": player.points,
                    "is_captain": player.player_id == team.captain_id,
                    "is_vice_captain": player.player_id == team.vice_captain_id
                })
            
            results.append({
                "id": team.id,
                "gameweek_id": team.gameweek_id,
                "gameweek_number": gameweek.number if gameweek else 0,
                "formation": team.formation,
                "total_points": team.total_points,
                "created_at": team.created_at,
                "players": players_with_details
            })
        
        return results
    
    def get_gameweek_result(self, user_id: int, gameweek_id: int) -> Optional[Dict[str, Any]]:
        """Dohvata rezultat za određeno kolo"""
        team = get_user_gameweek_team(self.session, user_id, gameweek_id)
        if not team:
            return None
        
        # Dohvati informacije o kolu
        gameweek_statement = select(Gameweek).where(Gameweek.id == gameweek_id)
        gameweek = self.session.exec(gameweek_statement).first()
        
        # Dohvati igrače tima
        if team.id is not None:
            players = get_gameweek_team_players(self.session, team.id)
        else:
            players = []
        
        # Dohvati informacije o igračima
        players_with_details = []
        for player in players:
            player_statement = select(Player).where(Player.id == player.player_id)
            player_details = self.session.exec(player_statement).first()
            
            players_with_details.append({
                "id": player.id,
                "player_id": player.player_id,
                "player_name": player_details.name if player_details else "Unknown",
                "position": player.position,
                "is_bench": player.is_bench,
                "points": player.points,
                "is_captain": player.player_id == team.captain_id,
                "is_vice_captain": player.player_id == team.vice_captain_id
            })
        
        return {
            "id": team.id,
            "gameweek_id": team.gameweek_id,
            "gameweek_number": gameweek.number if gameweek else 0,
            "formation": team.formation,
            "total_points": team.total_points,
            "created_at": team.created_at,
            "players": players_with_details
        }
    
    def _get_player_points_for_gameweek(self, player_id: int, gameweek_id: int) -> float:
        """Dohvata poene igrača za određeno kolo"""
        # Dohvati utakmice za ovo kolo
        matches_statement = select(Match).where(Match.gameweek_id == gameweek_id)
        matches = list(self.session.exec(matches_statement).all())
        match_ids = [match.id for match in matches]
        
        if not match_ids:
            return 0.0
        
        # Dohvati poene igrača za ove utakmice
        points_records = []
        for match_id in match_ids:
            points_statement = select(PlayerFantasyPoints).where(
                PlayerFantasyPoints.player_id == player_id,
                PlayerFantasyPoints.match_id == match_id
            )
            record = self.session.exec(points_statement).first()
            if record:
                points_records.append(record)
        
        return sum(record.points for record in points_records)
    
    def _calculate_total_points(self, team_id: int, captain_id: int, vice_captain_id: int) -> float:
        """Izračunava ukupne poene tima sa bonusima za kapiten i vice-kapiten"""
        players = get_gameweek_team_players(self.session, team_id)
        total_points = 0.0
        
        for player in players:
            if player.player_id == captain_id:
                # Kapiten dobija duplo poene
                total_points += player.points * 2
            elif player.player_id == vice_captain_id:
                # Vice-kapiten dobija normalne poene
                total_points += player.points
            else:
                # Ostali igrači dobijaju normalne poene
                total_points += player.points
        
        return total_points 