from sqlmodel import Session, select
from models.playerfantasypoints_model import PlayerFantasyPoints
from models.matchevent_model import MatchEvent
from models.player_model import Player
from models.match_model import Match
from models.match_lineup_model import MatchLineup, LineupType
from models.match_substitution_model import MatchSubstitution
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
            
            # Dohvati sve igrače koji su stvarno igrali u utakmici
            # (bilo u prvoj postavi ili kao zamjena)
            starting_players = self.db.exec(
                select(MatchLineup).where(
                    MatchLineup.match_id == match_id,
                    MatchLineup.lineup_type == LineupType.STARTING
                )
            ).all()
            
            # Dohvati sve zamjene
            substitutions = self.db.exec(
                select(MatchSubstitution).where(MatchSubstitution.match_id == match_id)
            ).all()
            
            # Kreiraj set igrača koji su igrali (prva postava + zamjene)
            players_who_played = set()
            for lineup in starting_players:
                players_who_played.add(lineup.player_id)
            for sub in substitutions:
                players_who_played.add(sub.player_in_id)
            
            # Dodaj appearance i clean sheet bodove za sve igrače koji su igrali
            for player_id in players_who_played:
                # Inicijalizuj poene ako igrač nije imao događaje
                if player_id not in player_points:
                    player_points[player_id] = 0
                
                # Izračunaj minute igrača
                minutes_played = self._calculate_player_minutes(player_id, match_id)
                
                # Dodaj appearance bodove samo ako je igrač stvarno igrao
                if minutes_played > 0:
                    appearance_points = self._calculate_appearance_points(minutes_played)
                    player_points[player_id] += appearance_points
                    print(f"Dodano {appearance_points} appearance poena za igrača {player_id} ({minutes_played} minuta)")
                
                # Dodaj clean sheet bodove
                player = self.db.get(Player, player_id)
                if player:
                    clean_sheet_points = self._calculate_clean_sheet_points(player_id, match_id, player.position, player.club_id)
                    if clean_sheet_points > 0:
                        player_points[player_id] += clean_sheet_points
                        print(f"Dodano {clean_sheet_points} clean sheet poena za igrača {player_id} ({player.position})")
            
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

                # Update player price based on points
                player = self.db.get(Player, player_id)
                if player:
                    if points > 0:
                        player.price += round(points / 10, 2)
                    elif points < 0:
                        player.price -= round(abs(points) / 10, 2)
                    # Ensure price doesn't go below a minimum (e.g., 0.1)
                    if player.price < 0.1:
                        player.price = 0.1
                    self.db.add(player)  # Mark as dirty for update
            
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
    
    def _calculate_player_minutes(self, player_id: int, match_id: int) -> int:
        """Izračunava minute koje je igrač odigrao u utakmici"""
        # Provjeri da li je igrač u prvoj postavi
        lineup = self.db.exec(
            select(MatchLineup).where(
                MatchLineup.match_id == match_id,
                MatchLineup.player_id == player_id,
                MatchLineup.lineup_type == LineupType.STARTING
            )
        ).first()
        
        # Pretpostavimo da utakmica traje 90 minuta
        MATCH_DURATION = 90
        
        if lineup:
            # Igrač je počeo u prvoj postavi
            # Provjeri da li je izašao
            substitution_out = self.db.exec(
                select(MatchSubstitution).where(
                    MatchSubstitution.match_id == match_id,
                    MatchSubstitution.player_out_id == player_id
                )
            ).first()
            
            if substitution_out:
                # Igrač je izašao u određenoj minuti
                return substitution_out.minute
            else:
                # Igrač je igrao cijelu utakmicu
                return MATCH_DURATION
        else:
            # Igrač nije u prvoj postavi, provjeri da li je ušao kao zamjena
            substitution_in = self.db.exec(
                select(MatchSubstitution).where(
                    MatchSubstitution.match_id == match_id,
                    MatchSubstitution.player_in_id == player_id
                )
            ).first()
            
            if substitution_in:
                # Igrač je ušao u određenoj minuti
                # Provjeri da li je izašao kasnije
                substitution_out = self.db.exec(
                    select(MatchSubstitution).where(
                        MatchSubstitution.match_id == match_id,
                        MatchSubstitution.player_out_id == player_id
                    )
                ).first()
                
                if substitution_out:
                    # Igrač je ušao i izašao
                    return substitution_out.minute - substitution_in.minute
                else:
                    # Igrač je ušao i igrao do kraja
                    return MATCH_DURATION - substitution_in.minute
            else:
                # Igrač nije igrao u utakmici
                return 0
    
    def _calculate_appearance_points(self, minutes_played: int) -> int:
        """Izračunava appearance bodove na osnovu odigranih minuta"""
        if minutes_played >= 60:
            # Igrač je odigrao 60+ minuta
            return 2
        elif minutes_played > 0:
            # Igrač je ušao u igru ali igrao manje od 60 minuta
            return 1
        else:
            # Igrač nije igrao
            return 0
    
    def _calculate_clean_sheet_points(self, player_id: int, match_id: int, player_position: str, player_club_id: int) -> int:
        """Izračunava clean sheet bodove - tim nije primio golove"""
        # Dohvati utakmicu
        match = self.db.get(Match, match_id)
        if not match:
            return 0
        
        # Provjeri da li je igrač uopće igrao (minimalno 60 minuta za clean sheet)
        minutes_played = self._calculate_player_minutes(player_id, match_id)
        if minutes_played < 60:
            return 0
        
        # Provjeri clean sheet za domaći tim
        if match.home_club_id == player_club_id:
            if match.away_score == 0:
                # Domaći tim nije primio golove
                return self._get_clean_sheet_points_by_position(player_position)
        
        # Provjeri clean sheet za gostujući tim
        if match.away_club_id == player_club_id:
            if match.home_score == 0:
                # Gostujući tim nije primio golove
                return self._get_clean_sheet_points_by_position(player_position)
        
        return 0
    
    def _get_clean_sheet_points_by_position(self, position: str) -> int:
        """Vraća clean sheet bodove na osnovu pozicije igrača"""
        clean_sheet_points = {
            "GK": 4,   # Golman
            "DEF": 4,  # Odbrana
            "MID": 1,  # Veznjak
            "FWD": 0   # Napadač
        }
        return clean_sheet_points.get(position, 0) 