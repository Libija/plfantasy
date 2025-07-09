from sqlmodel import Session, select
from models.playerfantasypoints_model import PlayerFantasyPoints
from models.matchevent_model import MatchEvent
from models.player_model import Player
from models.match_model import Match
from typing import List
import traceback

class FantasyPointsService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_fantasy_points_for_match(self, match_id: int) -> List[PlayerFantasyPoints]:
        """Preračunava fantasy poene za sve igrače u utakmici na osnovu događaja"""
        
        try:
            print(f"Počinjem preračunavanje fantasy poena za utakmicu {match_id}")
            
            # Dohvati sve događaje za utakmicu
            events = self.db.exec(
                select(MatchEvent).where(MatchEvent.match_id == match_id)
            ).all()
            
            print(f"Pronađeno {len(events)} događaja za utakmicu")
            
            # Dohvati utakmicu
            match = self.db.get(Match, match_id)
            if not match:
                raise ValueError(f"Utakmica sa ID {match_id} nije pronađena")
            
            print(f"Utakmica pronađena: {match.home_club_id} vs {match.away_club_id}")
            
            # Obriši postojeće fantasy poene za ovu utakmicu
            existing_points = self.db.exec(
                select(PlayerFantasyPoints).where(PlayerFantasyPoints.match_id == match_id)
            ).all()
            
            print(f"Brišem {len(existing_points)} postojećih fantasy poena")
            
            for point in existing_points:
                self.db.delete(point)
            
            # Rječnik za praćenje poena po igraču
            player_points = {}
            
            for event in events:
                player_id = event.player_id
                assist_player_id = event.assist_player_id
                
                print(f"Obrađujem događaj: {event.event_type} za igrača {player_id}")
                
                # Inicijalizuj poene za igrača ako ne postoje
                if player_id not in player_points:
                    player_points[player_id] = 0
                
                # Dohvati poziciju igrača
                player = self.db.get(Player, player_id)
                if not player:
                    print(f"Upozorenje: Igrač sa ID {player_id} nije pronađen, preskačem događaj")
                    continue
                
                # Izračunaj poene za događaj
                points = self._calculate_event_points(event.event_type, player.position)
                player_points[player_id] += points
                
                print(f"Dodano {points} poena za igrača {player_id} ({player.position})")
                
                # Ako postoji asistencija i događaj je gol, dodaj poene i za asistenta
                if assist_player_id and event.event_type == "goal":
                    if assist_player_id not in player_points:
                        player_points[assist_player_id] = 0
                    
                    assist_player = self.db.get(Player, assist_player_id)
                    if assist_player:
                        assist_points = self._calculate_event_points("assist", assist_player.position)
                        player_points[assist_player_id] += assist_points
                        print(f"Dodano {assist_points} poena za asistenta {assist_player_id}")
                    else:
                        print(f"Upozorenje: Asistent sa ID {assist_player_id} nije pronađen")
            
            # Kreiraj fantasy poene za sve igrače
            fantasy_points_list = []
            for player_id, points in player_points.items():
                fantasy_point = PlayerFantasyPoints(
                    player_id=player_id,
                    match_id=match_id,
                    points=points
                )
                self.db.add(fantasy_point)
                fantasy_points_list.append(fantasy_point)
            
            print(f"Kreiram {len(fantasy_points_list)} fantasy poena")
            
            self.db.commit()
            print("Fantasy poeni uspješno preračunati i sačuvani")
            return fantasy_points_list
            
        except Exception as e:
            self.db.rollback()
            print(f"Greška u calculate_fantasy_points_for_match: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise

    def _calculate_event_points(self, event_type: str, player_position: str) -> int:
        """Izračunava fantasy poene na osnovu tipa događaja i pozicije igrača"""
        
        if event_type == "goal":
            if player_position == "FWD":
                return 3
            elif player_position == "MID":
                return 4
            elif player_position == "DEF":
                return 5
            elif player_position == "GK":
                return 6
            else:
                return 3
                
        elif event_type == "assist":
            if player_position == "FWD":
                return 2
            elif player_position == "MID":
                return 1
            elif player_position == "DEF":
                return 3
            elif player_position == "GK":
                return 4
            else:
                return 2
                
        elif event_type == "yellow":
            return -1
            
        elif event_type == "red":
            return -3
            
        elif event_type == "own_goal":
            return -4
            
        elif event_type == "penalty_saved":
            return 4
            
        elif event_type == "penalty_missed":
            return -4
            
        else:
            return 0 