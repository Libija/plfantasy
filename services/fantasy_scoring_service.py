from sqlmodel import Session, select
from models.matchevent_model import MatchEvent, MatchEventType
from models.playerfantasypoints_model import PlayerFantasyPoints
from models.fantasyteamplayer import FantasyTeamPlayer
from models.gameweekscore_model import GameweekScore
from models.fantasyteam_model import FantasyTeam
from models.match_model import Match
from models.gameweek_model import Gameweek, GameweekStatus
from repositories.match_repository import get_matches_by_gameweek
from repositories.fantasy_team_repository import get_fantasy_team_by_id, update_team_budget
from typing import Dict, List, Optional
from datetime import datetime

class FantasyScoringService:
    def __init__(self, session: Session):
        self.session = session
        
        # Definicija bodova za različite događaje
        self.points_system = {
            MatchEventType.goal: {
                "GK": 6,    # Golman gol
                "DEF": 6,   # Odbrana gol
                "MID": 5,   # Veznjak gol
                "FWD": 4    # Napadač gol
            },
            MatchEventType.assist: {
                "GK": 3,    # Golman asistencija
                "DEF": 3,   # Odbrana asistencija
                "MID": 3,   # Veznjak asistencija
                "FWD": 3    # Napadač asistencija
            },
            MatchEventType.yellow: -1,      # Žuti karton
            MatchEventType.red: -3,         # Crveni karton
            MatchEventType.own_goal: -2,    # Autogol
            MatchEventType.penalty_saved: 5, # Obrana penala
            MatchEventType.penalty_missed: -2 # Propušteni penal
        }
        
        # Bodovi za clean sheet (nema primljenih golova)
        self.clean_sheet_points = {
            "GK": 4,
            "DEF": 4,
            "MID": 1,
            "FWD": 0
        }
        
        # Bodovi za igru (minimalno 60 minuta)
        self.appearance_points = {
            "GK": 2,
            "DEF": 2,
            "MID": 2,
            "FWD": 2
        }

    def calculate_player_points(self, player_id: int, match_id: int) -> int:
        """Izračunaj bodove za igrača u određenoj utakmici"""
        total_points = 0
        
        # Dohvati sve događaje za igrača u utakmici
        statement = select(MatchEvent).where(
            MatchEvent.player_id == player_id,
            MatchEvent.match_id == match_id
        )
        events = self.session.exec(statement).all()
        
        # Dohvati poziciju igrača
        from repositories.player_repository import get_player_by_id
        player = get_player_by_id(self.session, player_id)
        if not player:
            return 0
        
        position = player.position
        
        # Izračunaj bodove za događaje
        for event in events:
            if event.event_type in self.points_system:
                if isinstance(self.points_system[event.event_type], dict):
                    # Pozicijski bodovi (golovi, asistencije)
                    total_points += self.points_system[event.event_type].get(position, 0)
                else:
                    # Fiksni bodovi (kartoni, penali)
                    total_points += self.points_system[event.event_type]
        
        # Dodaj bodove za igru (pretpostavljamo da je igrao ako ima događaje)
        if events:
            total_points += self.appearance_points.get(position, 0)
        
        return total_points

    def calculate_clean_sheet_points(self, player_id: int, match_id: int) -> int:
        """Izračunaj bodove za clean sheet"""
        # Dohvati utakmicu
        statement = select(Match).where(Match.id == match_id)
        match = self.session.exec(statement).first()
        if not match:
            return 0
        
        # Dohvati poziciju igrača
        from repositories.player_repository import get_player_by_id
        player = get_player_by_id(self.session, player_id)
        if not player:
            return 0
        
        position = player.position
        
        # Provjeri clean sheet za domaći tim
        if match.home_club_id == player.club_id and match.away_score == 0:
            return self.clean_sheet_points.get(position, 0)
        
        # Provjeri clean sheet za gostujući tim
        if match.away_club_id == player.club_id and match.home_score == 0:
            return self.clean_sheet_points.get(position, 0)
        
        return 0

    def calculate_captain_bonus(self, base_points: int, is_captain: bool, is_vice_captain: bool) -> int:
        """Izračunaj bonus bodove za kapiten/vice-kapiten"""
        if is_captain:
            return base_points  # Kapiten dobija duplo bodove
        elif is_vice_captain:
            return base_points // 2  # Vice-kapiten dobija 1.5x bodove
        return 0

    def process_gameweek_points(self, gameweek: int, season: str = "2024/25") -> Dict[str, any]:
        """Obrađuje bodove za cijelo kolo"""
        # Dohvati sve utakmice u kolu
        matches = get_matches_by_gameweek(self.session, gameweek)
        
        if not matches:
            return {
                "success": False,
                "message": "Nema utakmica za ovo kolo"
            }
        
        # Dohvati sve fantasy timove
        from repositories.fantasy_team_repository import get_all_fantasy_teams
        fantasy_teams = get_all_fantasy_teams(self.session)
        
        total_processed = 0
        
        for fantasy_team in fantasy_teams:
            team_points = self.calculate_team_points_for_gameweek(fantasy_team.id, gameweek)
            
            # Spremi bodove tima za ovo kolo
            gameweek_score = GameweekScore(
                fantasy_team_id=fantasy_team.id,
                gameweek=gameweek,
                points=team_points
            )
            self.session.add(gameweek_score)
            
            # Ažuriraj ukupne bodove tima
            fantasy_team.total_points += team_points
            self.session.add(fantasy_team)
            
            total_processed += 1
        
        self.session.commit()
        
        return {
            "success": True,
            "message": f"Obrađeno {total_processed} timova za kolo {gameweek}",
            "teams_processed": total_processed
        }

    def calculate_team_points_for_gameweek(self, fantasy_team_id: int, gameweek: int) -> int:
        """Izračunaj bodove tima za određeno kolo"""
        # Dohvati sve igrače tima
        from repositories.fantasy_team_repository import get_fantasy_team_players
        team_players = get_fantasy_team_players(self.session, fantasy_team_id)
        
        # Dohvati sve utakmice u kolu
        matches = get_matches_by_gameweek(self.session, gameweek)
        
        total_team_points = 0
        
        for player_data in team_players:
            player_points = 0
            
            # Izračunaj bodove za svaku utakmicu u kolu
            for match in matches:
                # Provjeri da li je igrač igrao u ovoj utakmici
                if match.home_club_id == player_data["club_id"] or match.away_club_id == player_data["club_id"]:
                    # Osnovni bodovi
                    base_points = self.calculate_player_points(player_data["player_id"], match.id)
                    
                    # Clean sheet bodovi
                    clean_sheet_points = self.calculate_clean_sheet_points(player_data["player_id"], match.id)
                    
                    # Ukupni bodovi za ovu utakmicu
                    match_points = base_points + clean_sheet_points
                    
                    # Kapiten/vice-kapiten bonus
                    captain_bonus = self.calculate_captain_bonus(
                        match_points, 
                        player_data["is_captain"], 
                        player_data["is_vice_captain"]
                    )
                    
                    player_points += match_points + captain_bonus
            
            total_team_points += player_points
        
        return total_team_points

    def get_player_fantasy_points(self, player_id: int, gameweek: int) -> int:
        """Dohvati fantasy bodove igrača za određeno kolo"""
        # Dohvati sve utakmice u kolu
        matches = get_matches_by_gameweek(self.session, gameweek)
        
        total_points = 0
        
        for match in matches:
            # Provjeri da li je igrač igrao u ovoj utakmici
            from repositories.player_repository import get_player_by_id
            player = get_player_by_id(self.session, player_id)
            if not player:
                continue
                
            if match.home_club_id == player.club_id or match.away_club_id == player.club_id:
                base_points = self.calculate_player_points(player_id, match.id)
                clean_sheet_points = self.calculate_clean_sheet_points(player_id, match.id)
                total_points += base_points + clean_sheet_points
        
        return total_points

    def get_team_gameweek_summary(self, fantasy_team_id: int, gameweek: int) -> Dict[str, any]:
        """Dohvati sažetak bodova tima za određeno kolo"""
        # Dohvati bodove tima za ovo kolo
        statement = select(GameweekScore).where(
            GameweekScore.fantasy_team_id == fantasy_team_id,
            GameweekScore.gameweek == gameweek
        )
        gameweek_score = self.session.exec(statement).first()
        
        if not gameweek_score:
            return {
                "gameweek": gameweek,
                "points": 0,
                "players": []
            }
        
        # Dohvati detalje igrača
        from repositories.fantasy_team_repository import get_fantasy_team_players
        team_players = get_fantasy_team_players(self.session, fantasy_team_id)
        
        players_summary = []
        for player_data in team_players:
            player_points = self.get_player_fantasy_points(player_data["player_id"], gameweek)
            players_summary.append({
                "player_id": player_data["player_id"],
                "player_name": player_data["player_name"],
                "position": player_data["position"],
                "points": player_points,
                "is_captain": player_data["is_captain"],
                "is_vice_captain": player_data["is_vice_captain"]
            })
        
        return {
            "gameweek": gameweek,
            "points": gameweek_score.points,
            "players": players_summary
        } 