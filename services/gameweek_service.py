from typing import List, Optional
from datetime import datetime
from sqlmodel import Session
from models.gameweek_model import Gameweek, GameweekStatus
from schemas.gameweek_schema import GameweekCreate, GameweekUpdate, GameweekResponse, GameweekListResponse
from repositories.gameweek_repository import GameweekRepository

class GameweekService:
    def __init__(self, db: Session):
        self.repository = GameweekRepository(db)

    def create_gameweek(self, gameweek_data: GameweekCreate) -> GameweekResponse:
        """Kreira novo kolo sa validacijom"""
        # Provjeri da li već postoji kolo sa istim brojem u sezoni
        existing = self.repository.get_by_number_and_season(
            gameweek_data.number, gameweek_data.season
        )
        if existing:
            raise ValueError(f"Kolo broj {gameweek_data.number} već postoji u sezoni {gameweek_data.season}")

        # Provjeri preklapanje datuma
        if self.repository.check_date_overlap(
            gameweek_data.start_date, gameweek_data.end_date, gameweek_data.season
        ):
            raise ValueError("Datumi se preklapaju sa postojećim kolima u ovoj sezoni")

        # Kreiraj kolo
        gameweek = self.repository.create(gameweek_data)
        return GameweekResponse.from_orm(gameweek)

    def get_gameweek(self, gameweek_id: int) -> Optional[GameweekResponse]:
        """Dohvata kolo po ID-u"""
        gameweek = self.repository.get_by_id(gameweek_id)
        if not gameweek:
            return None
        return GameweekResponse.from_orm(gameweek)

    def get_all_gameweeks(self, season: Optional[str] = None, 
                         status: Optional[GameweekStatus] = None) -> List[GameweekListResponse]:
        """Dohvata sva kola sa opcionalnim filterima"""
        gameweeks_data = self.repository.get_with_match_count(season=season)
        
        # Ako je status filter postavljen, filtriraj rezultate
        if status:
            gameweeks_data = [gw for gw in gameweeks_data if gw['status'] == status]
        
        return [GameweekListResponse(**data) for data in gameweeks_data]

    def update_gameweek(self, gameweek_id: int, gameweek_data: GameweekUpdate) -> Optional[GameweekResponse]:
        """Ažurira kolo sa validacijom"""
        # Provjeri da li kolo postoji
        existing = self.repository.get_by_id(gameweek_id)
        if not existing:
            return None

        # Ako se mijenja broj kola, provjeri da li već postoji
        if gameweek_data.number is not None:
            duplicate = self.repository.get_by_number_and_season(
                gameweek_data.number, existing.season
            )
            if duplicate and duplicate.id != gameweek_id:
                raise ValueError(f"Kolo broj {gameweek_data.number} već postoji u sezoni {existing.season}")

        # Ako se mijenjaju datumi, provjeri preklapanje
        start_date = gameweek_data.start_date or existing.start_date
        end_date = gameweek_data.end_date or existing.end_date
        season = gameweek_data.season or existing.season
        
        if self.repository.check_date_overlap(start_date, end_date, season, exclude_id=gameweek_id):
            raise ValueError("Datumi se preklapaju sa postojećim kolima u ovoj sezoni")

        # Ažuriraj kolo
        updated_gameweek = self.repository.update(gameweek_id, gameweek_data)
        if not updated_gameweek:
            return None
        
        return GameweekResponse.from_orm(updated_gameweek)

    def delete_gameweek(self, gameweek_id: int) -> bool:
        """Briše kolo ako je moguće"""
        gameweek = self.repository.get_by_id(gameweek_id)
        if not gameweek:
            return False

        # Provjeri da li kolo može biti obrisano (samo zakazana kola)
        if gameweek.status != GameweekStatus.SCHEDULED:
            raise ValueError("Samo zakazana kola mogu biti obrisana")

        # TODO: Provjeri da li postoje utakmice u kolu
        # Za sada dozvoljavamo brisanje

        return self.repository.delete(gameweek_id)

    def change_gameweek_status(self, gameweek_id: int, new_status: GameweekStatus) -> Optional[GameweekResponse]:
        """Mijenja status kola"""
        gameweek = self.repository.get_by_id(gameweek_id)
        if not gameweek:
            return None

        # Validacija tranzicija statusa
        if gameweek.status == GameweekStatus.COMPLETED and new_status != GameweekStatus.COMPLETED:
            raise ValueError("Završena kola ne mogu biti promijenjena")

        if gameweek.status == GameweekStatus.IN_PROGRESS and new_status == GameweekStatus.SCHEDULED:
            raise ValueError("Kolo u toku ne može biti vraćeno na zakazano")

        # Ažuriraj status
        update_data = GameweekUpdate(status=new_status)
        updated_gameweek = self.repository.update(gameweek_id, update_data)
        if not updated_gameweek:
            return None
        
        return GameweekResponse.from_orm(updated_gameweek)

    def get_seasons(self) -> List[str]:
        """Dohvata sve sezone"""
        gameweeks = self.repository.get_all()
        seasons = list(set(gw.season for gw in gameweeks))
        return sorted(seasons, reverse=True)  # Najnovije prvo 