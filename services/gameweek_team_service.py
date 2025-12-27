from sqlmodel import Session, select
from models.gameweek_team_model import GameweekTeam
from models.gameweek_player_model import GameweekPlayer
from models.fantasyteam_model import FantasyTeam
from models.fantasyteamplayer import FantasyTeamPlayer
from models.player_model import Player
from models.gameweek_model import Gameweek
from models.playerfantasypoints_model import PlayerFantasyPoints
from models.match_model import Match
from models.user_model import User
from models.club_model import Club
from models.match_lineup_model import MatchLineup, LineupType
from models.match_substitution_model import MatchSubstitution
from repositories.gameweek_team_repository import (
    create_gameweek_team, get_gameweek_team_by_id, get_user_gameweek_teams,
    get_user_gameweek_team, get_completed_gameweek_teams, create_gameweek_player,
    get_gameweek_team_players, get_gameweek_team_with_players
)
from repositories.fantasy_team_repository import get_fantasy_team_players
from repositories.transfer_log_repository import TransferLogRepository
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
        skipped = 0
        
        for fantasy_team in fantasy_teams:
            try:
                print(f"[DEBUG] --- User {fantasy_team.user_id} ---")
                
                # Očisti session cache prije provjere
                self.session.expire_all()
                
                # Provjeri da li snapshot postoji u bazi (direktan upit, ne kroz cache)
                existing_snapshot = get_user_gameweek_team(self.session, fantasy_team.user_id, gameweek_id)
                print(f"[DEBUG] Postoji snapshot? {existing_snapshot}")
                
                if existing_snapshot:
                    # Provjeri da li snapshot stvarno postoji u bazi i ima li igrače
                    try:
                        self.session.refresh(existing_snapshot)
                        
                        # Provjeri da li snapshot ima igrače
                        from repositories.gameweek_team_repository import get_gameweek_team_players
                        players = get_gameweek_team_players(self.session, existing_snapshot.id)
                        players_count = len(players) if players else 0
                        
                        print(f"[DEBUG] Snapshot postoji u bazi (id={existing_snapshot.id}), ima {players_count} igrača")
                        
                        if players_count == 0:
                            # Snapshot postoji ali nema igrača - obriši ga i kreiraj novi
                            print(f"[DEBUG] Snapshot {existing_snapshot.id} nema igrače - brišem ga i kreiram novi")
                            
                            # Obriši GameweekPlayer zapise (ako postoje)
                            for player in players:
                                self.session.delete(player)
                            
                            # Obriši GameweekTeam
                            self.session.delete(existing_snapshot)
                            self.session.flush()
                            
                            print(f"[DEBUG] Stari snapshot obrisan, kreiram novi...")
                            # Nastavi sa kreiranjem novog snapshot-a
                        else:
                            # Snapshot postoji i ima igrače - preskoči
                            print(f"[DEBUG] Preskačem user {fantasy_team.user_id} (već postoji snapshot u bazi sa igračima, id={existing_snapshot.id})")
                            skipped += 1
                            continue
                            
                    except Exception as e:
                        # Ako refresh ne uspije, snapshot ne postoji u bazi - ukloni iz session-a i nastavi
                        print(f"[DEBUG] Snapshot iz cache-a ne postoji u bazi za user {fantasy_team.user_id}: {str(e)}. Nastavljam sa kreiranjem.")
                        try:
                            self.session.expunge(existing_snapshot)
                        except:
                            pass
                        # Nastavi sa kreiranjem snapshot-a
                
                snapshot = self.create_team_snapshot(fantasy_team.user_id, gameweek_id, commit=False)
                print(f"[DEBUG] Kreiran snapshot: {snapshot}")
                
                if snapshot:
                    created_snapshots += 1
                else:
                    # Snapshot nije kreiran (možda tim nema igrače)
                    skipped += 1
                    print(f"[DEBUG] Snapshot nije kreiran za user {fantasy_team.user_id} (tim možda nema igrače)")
                    
            except Exception as e:
                print(f"[DEBUG] Greška za korisnika {fantasy_team.user_id}: {str(e)}")
                import traceback
                print(f"[DEBUG] Traceback: {traceback.format_exc()}")
                errors.append(f"Greška za korisnika {fantasy_team.user_id}: {str(e)}")
        print(f"[DEBUG] SESSION STATUS PRIJE COMMIT-A:")
        print(f"[DEBUG]   DIRTY: {len(self.session.dirty)} objekata")
        print(f"[DEBUG]   NEW: {len(self.session.new)} objekata")
        print(f"[DEBUG]   DELETED: {len(self.session.deleted)} objekata")
        
        if len(self.session.new) > 0:
            print(f"[DEBUG] Novi objekti u session-u: {[str(obj) for obj in list(self.session.new)[:5]]}")
        
        # Flush prije commit-a da osiguramo da se sve šalje u bazu
        self.session.flush()
        print(f"[DEBUG] SESSION FLUSHED")
        
        # Commit sve promjene
        self.session.commit()
        print(f"[DEBUG] SESSION COMMIT DONE")
        
        # Provjeri da li su objekti stvarno commit-ovani
        print(f"[DEBUG] SESSION STATUS NAKON COMMIT-A:")
        print(f"[DEBUG]   DIRTY: {len(self.session.dirty)} objekata")
        print(f"[DEBUG]   NEW: {len(self.session.new)} objekata")
        print(f"[DEBUG]   DELETED: {len(self.session.deleted)} objekata")
        print(f"[DEBUG] === POVRATNA VRIJEDNOST: Kreirano {created_snapshots} snapshot-a, preskočeno {skipped}, errors: {len(errors)} ===")
        return {
            "success": True,
            "message": f"Kreirano {created_snapshots} snapshot-a za kolo {gameweek_id}",
            "created_snapshots": created_snapshots,
            "skipped": skipped,
            "errors": errors
        }
    
    def create_team_snapshot(self, user_id: int, gameweek_id: int, commit: bool = True) -> Optional[GameweekTeam]:
        """Kreira snapshot tima za određeno kolo"""
        try:
            # Očisti session cache da osiguramo da dohvaćamo svježe podatke iz baze
            self.session.expire_all()
            
            # Provjeri da li već postoji snapshot za ovo kolo
            existing_snapshot = get_user_gameweek_team(self.session, user_id, gameweek_id)
            
            # Provjeri da li snapshot stvarno postoji u bazi (ne samo u cache-u)
            if existing_snapshot:
                # Provjeri da li snapshot stvarno postoji u bazi provjerom ID-a
                try:
                    # Pokušaj refresh-ati objekt iz baze
                    self.session.refresh(existing_snapshot)
                    print(f"[DEBUG] Snapshot već postoji za user_id={user_id}, gameweek_id={gameweek_id}, id={existing_snapshot.id}")
                    return existing_snapshot
                except Exception as e:
                    # Ako refresh ne uspije, snapshot ne postoji u bazi - nastavi sa kreiranjem
                    print(f"[DEBUG] Snapshot iz cache-a ne postoji u bazi (refresh failed): {str(e)}. Nastavljam sa kreiranjem.")
                    # Ukloni objekt iz session-a
                    self.session.expunge(existing_snapshot)
            
            # Dohvati fantasy tim korisnika
            fantasy_team_statement = select(FantasyTeam).where(FantasyTeam.user_id == user_id)
            fantasy_team = self.session.exec(fantasy_team_statement).first()
            if not fantasy_team:
                print(f"[DEBUG] Fantasy tim nije pronađen za user_id={user_id}")
                return None
            
            # Dohvati igrače tima sa informacijama o kapitenima
            team_players_statement = select(FantasyTeamPlayer, Player).join(Player, Player.id == FantasyTeamPlayer.player_id).where(
                FantasyTeamPlayer.fantasy_team_id == fantasy_team.id
            )
            team_players_data = list(self.session.exec(team_players_statement).all())
            print(f"[DEBUG] team_players_data: {len(team_players_data)} igrača")
            
            # Provjeri da li tim ima igrače
            if not team_players_data or len(team_players_data) == 0:
                print(f"[DEBUG] UPOZORENJE: Tim user_id={user_id} nema igrača. Preskačem kreiranje snapshot-a.")
                # Vraćamo None umjesto kreiranja snapshot-a bez igrača
                return None
            
            # Pronađi kapiten i vice-kapiten
            captain_id = None
            vice_captain_id = None
            for ftp, player in team_players_data:
                if not player or not player.id:
                    continue
                if ftp.is_captain:
                    captain_id = player.id
                elif ftp.is_vice_captain:
                    vice_captain_id = player.id
            
            # Provjeri da li captain_id i vice_captain_id postoje u igračima
            valid_captain_id = None
            valid_vice_captain_id = None
            
            # Pronađi prvi igrač iz tima kao fallback (za slučaj da nema kapiten/vice-kapiten)
            first_player_id = None
            for _, player in team_players_data:
                if player and player.id:
                    first_player_id = player.id
                    break
            
            if captain_id:
                # Provjeri da li kapiten postoji u listi igrača
                captain_exists = any(player.id == captain_id for _, player in team_players_data if player)
                if captain_exists:
                    valid_captain_id = captain_id
                else:
                    print(f"[DEBUG] UPOZORENJE: Kapiten sa ID={captain_id} ne postoji u timu")
                    # Koristimo prvi igrač kao fallback
                    if first_player_id:
                        valid_captain_id = first_player_id
                        print(f"[DEBUG] Koristim prvi igrač (ID={first_player_id}) kao fallback za kapiten")
            
            if vice_captain_id:
                # Provjeri da li vice-kapiten postoji u listi igrača
                vice_captain_exists = any(player.id == vice_captain_id for _, player in team_players_data if player)
                if vice_captain_exists:
                    valid_vice_captain_id = vice_captain_id
                else:
                    print(f"[DEBUG] UPOZORENJE: Vice-kapiten sa ID={vice_captain_id} ne postoji u timu")
                    # Koristimo prvi igrač kao fallback (ili drugi ako je prvi već kapiten)
                    if first_player_id:
                        # Pronađi drugi igrač ako je prvi već kapiten
                        second_player_id = None
                        for _, player in team_players_data:
                            if player and player.id and player.id != valid_captain_id:
                                second_player_id = player.id
                                break
                        valid_vice_captain_id = second_player_id if second_player_id else first_player_id
                        print(f"[DEBUG] Koristim igrača (ID={valid_vice_captain_id}) kao fallback za vice-kapiten")
            
            # Ako ni kapiten ni vice-kapiten nisu postavljeni, koristimo prvi igrač
            if not valid_captain_id and first_player_id:
                valid_captain_id = first_player_id
                print(f"[DEBUG] Nema kapiten, koristim prvi igrač (ID={first_player_id})")
            
            if not valid_vice_captain_id and first_player_id:
                # Pronađi drugi igrač ako je prvi već kapiten
                second_player_id = None
                for _, player in team_players_data:
                    if player and player.id and player.id != valid_captain_id:
                        second_player_id = player.id
                        break
                valid_vice_captain_id = second_player_id if second_player_id else first_player_id
                print(f"[DEBUG] Nema vice-kapiten, koristim igrača (ID={valid_vice_captain_id})")
            
            # Osiguraj da imamo validne ID-ove (ne 0) - provjeri da li igrači postoje u bazi
            final_captain_id = valid_captain_id if valid_captain_id else (first_player_id if first_player_id else None)
            final_vice_captain_id = valid_vice_captain_id if valid_vice_captain_id else (first_player_id if first_player_id else None)
            
            # Provjeri da li captain_id i vice_captain_id postoje u player tablici
            if final_captain_id:
                captain_exists = self.session.get(Player, final_captain_id)
                if not captain_exists:
                    print(f"[DEBUG] UPOZORENJE: Captain sa ID={final_captain_id} ne postoji u player tablici")
                    final_captain_id = first_player_id if first_player_id else None
            
            if final_vice_captain_id:
                vice_captain_exists = self.session.get(Player, final_vice_captain_id)
                if not vice_captain_exists:
                    print(f"[DEBUG] UPOZORENJE: Vice-captain sa ID={final_vice_captain_id} ne postoji u player tablici")
                    # Koristi drugi igrač ili prvi ako nema drugog
                    second_player_id = None
                    for _, player in team_players_data:
                        if player and player.id and player.id != final_captain_id:
                            second_player_id = player.id
                            break
                    final_vice_captain_id = second_player_id if second_player_id else first_player_id
            
            # Ako nema validnih ID-ova, koristi prvi igrač ili None
            if not final_captain_id and first_player_id:
                final_captain_id = first_player_id
            if not final_vice_captain_id and first_player_id:
                # Pronađi drugi igrač ako je prvi već kapiten
                second_player_id = None
                for _, player in team_players_data:
                    if player and player.id and player.id != final_captain_id:
                        second_player_id = player.id
                        break
                final_vice_captain_id = second_player_id if second_player_id else first_player_id
            
            # Model zahtijeva int, ne Optional, pa koristimo 0 ako nema igrača
            # ALI to će uzrokovati foreign key constraint grešku!
            # Provjeri da li imamo barem jednog igrača
            if not first_player_id:
                print(f"[DEBUG] KRITIČNO: Nema igrača u timu, ne mogu kreirati GameweekTeam")
                return None
            
            # Koristimo prvi igrač za oba ako nema postavljenih
            final_captain_id = final_captain_id or first_player_id
            final_vice_captain_id = final_vice_captain_id or first_player_id
            
            print(f"[DEBUG] Final captain_id={final_captain_id}, vice_captain_id={final_vice_captain_id}")
            
            # Kreiraj gameweek tim
            gameweek_team = GameweekTeam(
                user_id=user_id,
                gameweek_id=gameweek_id,
                formation=fantasy_team.formation or "4-4-2",  # Default formacija ako nije postavljena
                captain_id=final_captain_id,
                vice_captain_id=final_vice_captain_id,
                total_points=0.0
            )
            
            print(f"[DEBUG] Pozivam create_gameweek_team sa commit={commit}")
            print(f"[DEBUG] GameweekTeam objekt prije kreiranja: user_id={gameweek_team.user_id}, gameweek_id={gameweek_team.gameweek_id}, captain_id={gameweek_team.captain_id}, vice_captain_id={gameweek_team.vice_captain_id}")
            
            try:
                created_team = create_gameweek_team(self.session, gameweek_team, commit=commit)
                print(f"[DEBUG] create_gameweek_team vratio: {created_team}")
                
                if not created_team:
                    print(f"[DEBUG] Greška: create_gameweek_team vratio None za user_id={user_id}")
                    return None
                
                if not created_team.id:
                    print(f"[DEBUG] Greška: created_team nema ID za user_id={user_id}")
                    # Pokušaj flush-ati da dobije ID
                    try:
                        self.session.flush()
                        print(f"[DEBUG] Nakon flush-a, created_team.id={created_team.id}")
                    except Exception as flush_error:
                        print(f"[DEBUG] Greška pri flush-u: {str(flush_error)}")
                        import traceback
                        print(f"[DEBUG] Traceback: {traceback.format_exc()}")
                        return None
                
                print(f"[DEBUG] GameweekTeam uspješno kreiran sa ID={created_team.id}")
            except Exception as e:
                print(f"[DEBUG] Greška pri kreiranju GameweekTeam za user_id={user_id}: {str(e)}")
                import traceback
                print(f"[DEBUG] Traceback: {traceback.format_exc()}")
                return None
            
            self.session.flush()  # Osiguraj da team ima ID prije upisa igrača
            print(f"[DEBUG] GameweekTeam kreiran sa ID={created_team.id}, sada dodajem igrače...")
            print(f"[DEBUG] Broj igrača u team_players_data: {len(team_players_data)}")
            
            # Dodaj igrače u snapshot
            players_added = 0
            if not team_players_data or len(team_players_data) == 0:
                print(f"[DEBUG] KRITIČNO: team_players_data je prazan! Ne mogu dodati igrače.")
            else:
                print(f"[DEBUG] Počinjem petlju za dodavanje {len(team_players_data)} igrača...")
                for idx, (ftp, player) in enumerate(team_players_data):
                    print(f"[DEBUG] --- Iteracija {idx+1}/{len(team_players_data)} ---")
                    print(f"[DEBUG] ftp={ftp}, player={player}")
                    
                    if not player:
                        print(f"[DEBUG] UPOZORENJE: player je None, preskačem")
                        continue
                    
                    if not player.id:
                        print(f"[DEBUG] UPOZORENJE: player.id je None, preskačem")
                        continue
                    
                    if not ftp:
                        print(f"[DEBUG] UPOZORENJE: ftp je None, preskačem")
                        continue
                    
                    try:
                        print(f"[DEBUG] Dodajem igrača {player.id} ({player.name}) u snapshot tima {created_team.id}")
                        
                        # Dohvati poene igrača za ovo kolo
                        print(f"[DEBUG] Dohvaćam poene za igrača {player.id} u kolu {gameweek_id}...")
                        points = self._get_player_points_for_gameweek(player.id, gameweek_id)
                        print(f"[DEBUG] Igrač {player.id} ima {points} poena za kolo {gameweek_id}")
                        
                        # Provjeri poziciju
                        position_str = player.position.value if hasattr(player.position, 'value') else str(player.position)
                        print(f"[DEBUG] Pozicija igrača: {position_str}")
                        
                        # Provjeri da li je na klupi
                        is_bench = ftp.role == "BENCH" or "_BENCH" in (ftp.formation_position or "")
                        print(f"[DEBUG] Igrač je na klupi: {is_bench} (role={ftp.role}, formation_position={ftp.formation_position})")
                        
                        gameweek_player = GameweekPlayer(
                            gameweek_team_id=created_team.id,
                            player_id=player.id,
                            position=position_str,
                            is_bench=is_bench,
                            points=points
                        )
                        print(f"[DEBUG] Kreiran GameweekPlayer objekt: team_id={created_team.id}, player_id={player.id}, points={points}")
                        
                        result = create_gameweek_player(self.session, gameweek_player, commit=commit)
                        print(f"[DEBUG] create_gameweek_player pozvan, rezultat: {result}")
                        
                        if commit:
                            self.session.flush()
                            print(f"[DEBUG] Session flushed nakon dodavanja igrača {player.id}")
                        
                        players_added += 1
                        print(f"[DEBUG] ✓ Igrač {player.id} uspješno dodan. Ukupno dodano: {players_added}")
                    except Exception as e:
                        print(f"[DEBUG] ✗ GREŠKA pri dodavanju igrača {player.id}: {str(e)}")
                        import traceback
                        print(f"[DEBUG] Traceback: {traceback.format_exc()}")
                        # Nastavi sa sljedećim igračem
                        continue
                
                print(f"[DEBUG] Petlja završena. Ukupno dodano igrača: {players_added}")
            
            if players_added == 0:
                print(f"[DEBUG] UPOZORENJE: Nije dodan nijedan igrač u snapshot za user_id={user_id}")
                # Možemo vratiti None ili nastaviti sa 0 poena
                # Vraćamo snapshot sa 0 poena
                created_team.total_points = 0.0
            else:
                # Izračunaj ukupne poene
                try:
                    total_points = self._calculate_total_points(
                        created_team.id, 
                        final_captain_id, 
                        final_vice_captain_id
                    )
                    created_team.total_points = total_points
                except Exception as e:
                    print(f"[DEBUG] Greška pri računanju poena: {str(e)}")
                    created_team.total_points = 0.0
            
            # created_team je već dodan u session u create_gameweek_team
            # Samo ažuriraj total_points i flush/commit
            if commit:
                self.session.commit()
                self.session.refresh(created_team)
            else:
                # Flush da osiguramo da se sve šalje u bazu (ali ne commit-uje)
                self.session.flush()
                print(f"[DEBUG] Session flushed (commit=False), objekti će biti commit-ovani kasnije")
            
            print(f"[DEBUG] Snapshot uspješno kreiran za user_id={user_id}, gameweek_id={gameweek_id}, total_points={created_team.total_points}")
            print(f"[DEBUG] Session status: dirty={len(self.session.dirty)}, new={len(self.session.new)}, deleted={len(self.session.deleted)}")
            return created_team
            
        except Exception as e:
            print(f"[DEBUG] KRITIČNA GREŠKA u create_team_snapshot za user_id={user_id}, gameweek_id={gameweek_id}: {str(e)}")
            import traceback
            print(f"[DEBUG] Traceback: {traceback.format_exc()}")
            if commit:
                self.session.rollback()
            return None
    
    def get_user_results(self, user_id: int) -> List[Dict[str, Any]]:
        """Dohvata rezultate korisnika iz svih završenih kola"""
        completed_teams = get_completed_gameweek_teams(self.session, user_id)
        results = []
        
        for team in completed_teams:
            # Dohvati informacije o kolu
            gameweek_statement = select(Gameweek).where(Gameweek.id == team.gameweek_id)
            gameweek = self.session.exec(gameweek_statement).first()
            
            # Provjeri da li je kapiten igrao (ima minute > 0)
            captain_played = True
            if team.captain_id and team.captain_id > 0 and team.gameweek_id:
                captain_minutes = self._calculate_player_minutes_for_gameweek(team.captain_id, team.gameweek_id)
                captain_played = captain_minutes > 0
            
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
                
                is_captain = player.player_id == team.captain_id
                is_vice_captain = player.player_id == team.vice_captain_id
                base_points = player.points or 0.0
                
                # Izračunaj final_points sa bonusom
                if is_captain:
                    if captain_played:
                        final_points = base_points * 2  # Kapiten igrao → ×2
                    else:
                        final_points = base_points  # Kapiten nije igrao → ×1
                elif is_vice_captain:
                    if captain_played:
                        final_points = base_points  # Kapiten igrao → vice-kapiten ×1
                    else:
                        final_points = base_points * 2  # Kapiten nije igrao → vice-kapiten ×2
                else:
                    final_points = base_points  # Ostali ×1
                
                players_with_details.append({
                    "id": player.id,
                    "player_id": player.player_id,
                    "player_name": player_details.name if player_details else "Unknown",
                    "position": player.position,
                    "is_bench": player.is_bench,
                    "points": base_points,
                    "final_points": final_points,
                    "is_captain": is_captain,
                    "is_vice_captain": is_vice_captain,
                    "price": player_details.price if player_details else 0.0
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
        
        # Provjeri da li je kapiten igrao (ima minute > 0)
        captain_played = True
        if team.captain_id and team.captain_id > 0 and team.gameweek_id:
            captain_minutes = self._calculate_player_minutes_for_gameweek(team.captain_id, team.gameweek_id)
            captain_played = captain_minutes > 0
        
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
            
            is_captain = player.player_id == team.captain_id
            is_vice_captain = player.player_id == team.vice_captain_id
            base_points = player.points or 0.0
            
            # Izračunaj final_points sa bonusom
            if is_captain:
                if captain_played:
                    final_points = base_points * 2  # Kapiten igrao → ×2
                else:
                    final_points = base_points  # Kapiten nije igrao → ×1
            elif is_vice_captain:
                if captain_played:
                    final_points = base_points  # Kapiten igrao → vice-kapiten ×1
                else:
                    final_points = base_points * 2  # Kapiten nije igrao → vice-kapiten ×2
            else:
                final_points = base_points  # Ostali ×1
            
            players_with_details.append({
                "id": player.id,
                "player_id": player.player_id,
                "player_name": player_details.name if player_details else "Unknown",
                "position": player.position,
                "is_bench": player.is_bench,
                "points": base_points,
                "final_points": final_points,
                "is_captain": is_captain,
                "is_vice_captain": is_vice_captain
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
    
    def _calculate_player_minutes_for_gameweek(self, player_id: int, gameweek_id: int) -> int:
        """Izračunava ukupne minute koje je igrač odigrao u svim utakmicama kola.
        Koristi postojeću metodu _calculate_player_minutes iz FantasyPointsService."""
        from services.fantasy_points_service import FantasyPointsService
        
        # Dohvati utakmice za ovo kolo
        matches_statement = select(Match).where(Match.gameweek_id == gameweek_id)
        matches = list(self.session.exec(matches_statement).all())
        
        if not matches:
            return 0
        
        # Koristi FantasyPointsService za računanje minuta
        points_service = FantasyPointsService(self.session)
        total_minutes = 0
        
        for match in matches:
            minutes = points_service._calculate_player_minutes(player_id, match.id)
            total_minutes += minutes
        
        return total_minutes
    
    def _calculate_total_points(self, team_id: int, captain_id: int, vice_captain_id: int) -> float:
        """Izračunava ukupne poene tima sa bonusima za kapiten i vice-kapiten i transfer penalty.
        Napomena: Bodovi igrača sa klupe (is_bench=True) se NE računaju u total points."""
        try:
            if not team_id:
                print(f"[DEBUG] _calculate_total_points: team_id je None ili 0")
                return 0.0
            
            players = get_gameweek_team_players(self.session, team_id)
            if not players:
                print(f"[DEBUG] _calculate_total_points: Nema igrača za team_id={team_id}")
                return 0.0
            
            total_points = 0.0
            bench_points = 0.0  # Bodovi igrača sa klupe (samo za debug)
            
            # Dohvati gameweek_id za provjeru minuta kapitena
            team = self.session.get(GameweekTeam, team_id)
            gameweek_id = team.gameweek_id if team else None
            
            # Provjeri da li je kapiten igrao (ima minute > 0)
            captain_played = True  # Default: pretpostavljamo da je igrao
            if captain_id and captain_id > 0 and gameweek_id:
                captain_minutes = self._calculate_player_minutes_for_gameweek(captain_id, gameweek_id)
                captain_played = captain_minutes > 0
                print(f"[DEBUG] _calculate_total_points: Kapiten (ID={captain_id}) ima {captain_minutes} minuta u kolu {gameweek_id}. Igrao: {captain_played}")
            
            for player in players:
                if not player:
                    continue
                
                # Igrači sa klupe ne doprinose bodovima tima
                if player.is_bench:
                    bench_points += player.points or 0.0
                    continue
                
                player_points = player.points or 0.0
                
                # Provjeri da li je captain_id validan (ne 0)
                if captain_id and captain_id > 0 and player.player_id == captain_id:
                    if captain_played:
                        # Kapiten je igrao - dobija duplo poene
                        total_points += player_points * 2
                        print(f"[DEBUG] _calculate_total_points: Kapiten (ID={captain_id}) igrao - dobija duplo poene: {player_points * 2}")
                    else:
                        # Kapiten nije igrao - dobija normalne poene (ili 0 ako nema poena)
                        total_points += player_points
                        print(f"[DEBUG] _calculate_total_points: Kapiten (ID={captain_id}) NIJE igrao - dobija normalne poene: {player_points}")
                elif vice_captain_id and vice_captain_id > 0 and player.player_id == vice_captain_id:
                    if not captain_played:
                        # Kapiten nije igrao - vice-kapiten dobija duplo poene
                        total_points += player_points * 2
                        print(f"[DEBUG] _calculate_total_points: Vice-kapiten (ID={vice_captain_id}) dobija duplo poene jer kapiten nije igrao: {player_points * 2}")
                    else:
                        # Kapiten je igrao - vice-kapiten dobija normalne poene
                        total_points += player_points
                        print(f"[DEBUG] _calculate_total_points: Vice-kapiten (ID={vice_captain_id}) dobija normalne poene: {player_points}")
                else:
                    # Ostali igrači iz prvih 11 dobijaju normalne poene
                    total_points += player_points
            
            print(f"[DEBUG] _calculate_total_points: team_id={team_id}, starting11_points={total_points}, bench_points={bench_points}")
            
            # Dohvati transfer penalty za ovo kolo
            team = self.session.get(GameweekTeam, team_id)
            if team and team.gameweek_id:
                try:
                    # Pronađi fantasy_team_id iz user_id
                    fantasy_team_statement = select(FantasyTeam).where(FantasyTeam.user_id == team.user_id)
                    fantasy_team = self.session.exec(fantasy_team_statement).first()
                    
                    if fantasy_team and fantasy_team.id:
                        transfer_repo = TransferLogRepository(self.session)
                        transfers_this_week = transfer_repo.get_transfer_count_by_gameweek(
                            fantasy_team.id, team.gameweek_id
                        )
                        
                        # ISTA FORMULA KAO NA FRONTEND-U!
                        free_transfers = 3
                        penalty = max(0, transfers_this_week - free_transfers) * 4
                        
                        print(f"[DEBUG] _calculate_total_points: team_id={team_id}, gameweek={team.gameweek_id}, transfers={transfers_this_week}, penalty={penalty}")
                        
                        # FINALNI POENI = player_points - penalty
                        total_points -= penalty
                except Exception as e:
                    print(f"[DEBUG] Greška pri računanju transfer penalty: {str(e)}")
                    # Nastavi bez penalty-ja ako ne možemo izračunati
            
            return total_points
        except Exception as e:
            print(f"[DEBUG] Greška u _calculate_total_points za team_id={team_id}: {str(e)}")
            import traceback
            print(f"[DEBUG] Traceback: {traceback.format_exc()}")
            return 0.0

    def get_best_team_for_gameweek(self, gameweek_id: int) -> Optional[Dict[str, Any]]:
        """Dohvata najbolji tim (najviše poena) za određeno kolo"""
        # Dohvati sve timove za ovo kolo
        statement = select(GameweekTeam).where(GameweekTeam.gameweek_id == gameweek_id)
        teams = list(self.session.exec(statement).all())
        
        if not teams:
            return None
        
        # Pronađi tim sa najviše poena
        best_team = max(teams, key=lambda t: t.total_points)
        
        # Dohvati informacije o kolu
        gameweek_statement = select(Gameweek).where(Gameweek.id == gameweek_id)
        gameweek = self.session.exec(gameweek_statement).first()
        
        # Dohvati informacije o korisniku
        user_statement = select(User).where(User.id == best_team.user_id)
        user = self.session.exec(user_statement).first()
        
        # Dohvati igrače tima
        if best_team.id is not None:
            players = get_gameweek_team_players(self.session, best_team.id)
        else:
            players = []
        
        # Dohvati informacije o igračima
        players_with_details = []
        for player in players:
            player_statement = select(Player).where(Player.id == player.player_id)
            player_details = self.session.exec(player_statement).first()
            
            # Dohvati informacije o klubu igrača
            team_name = None
            if player_details and player_details.club_id:
                club_statement = select(Club).where(Club.id == player_details.club_id)
                club = self.session.exec(club_statement).first()
                team_name = club.name if club else None
            
            players_with_details.append({
                "id": player.id,
                "player_id": player.player_id,
                "player_name": player_details.name if player_details else "Unknown",
                "position": player.position,
                "is_bench": player.is_bench,
                "points": player.points,
                "is_captain": player.player_id == best_team.captain_id,
                "is_vice_captain": player.player_id == best_team.vice_captain_id,
                "price": player_details.price if player_details else 0.0,
                "team_name": team_name
            })
        
        return {
            "id": best_team.id,
            "gameweek_id": best_team.gameweek_id,
            "gameweek_number": gameweek.number if gameweek else 0,
            "gameweek_season": gameweek.season if gameweek else "",
            "user_id": best_team.user_id,
            "username": user.username if user else "Unknown",
            "formation": best_team.formation,
            "total_points": best_team.total_points,
            "created_at": best_team.created_at,
            "players": players_with_details
        } 