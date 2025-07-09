from typing import List, Optional
from datetime import datetime
from sqlmodel import Session
from models.match_model import Match, MatchStatus
from schemas.match_schema import MatchCreate, MatchUpdate, MatchResponse, MatchListResponse, MatchWithClubsResponse
from repositories.match_repository import MatchRepository

class MatchService:
    def __init__(self, db: Session):
        self.repository = MatchRepository(db)

    def create_match(self, match_data: MatchCreate) -> MatchResponse:
        """Kreira novu utakmicu sa validacijom"""
        # Provjeri da li klubovi postoje (TODO: implementirati kada dodamo Club service)
        
        # Provjeri da li kolo postoji ako je navedeno
        if match_data.gameweek_id:
            # TODO: implementirati provjeru kada dodamo Gameweek service
            pass
        
        # Kreiraj utakmicu
        match = self.repository.create(match_data)
        return MatchResponse.from_orm(match)

    def get_match(self, match_id: int) -> Optional[MatchResponse]:
        """Dohvata utakmicu po ID-u"""
        match = self.repository.get_by_id(match_id)
        if not match:
            return None
        return MatchResponse.from_orm(match)

    def get_all_matches(self, gameweek_id: Optional[int] = None, 
                       status: Optional[MatchStatus] = None) -> List[MatchListResponse]:
        """Dohvata sve utakmice sa opcionalnim filterima"""
        matches_data = self.repository.get_with_clubs(gameweek_id=gameweek_id)
        
        # Ako je status filter postavljen, filtriraj rezultate
        if status:
            matches_data = [m for m in matches_data if m['status'] == status]
        
        return [MatchListResponse(**data) for data in matches_data]

    def get_matches_by_gameweek(self, gameweek_id: int) -> List[MatchListResponse]:
        """Dohvata sve utakmice za određeno kolo"""
        matches_data = self.repository.get_with_clubs(gameweek_id=gameweek_id)
        return [MatchListResponse(**data) for data in matches_data]

    def update_match(self, match_id: int, match_data: MatchUpdate) -> Optional[MatchResponse]:
        """Ažurira utakmicu sa validacijom"""
        # Provjeri da li utakmica postoji
        existing = self.repository.get_by_id(match_id)
        if not existing:
            return None

        # Ako se mijenjaju klubovi, provjeri da li su različiti
        if match_data.home_club_id is not None and match_data.away_club_id is not None:
            if match_data.home_club_id == match_data.away_club_id:
                raise ValueError("Domaći i gostujući klub ne mogu biti isti")
        elif match_data.home_club_id is not None:
            if match_data.home_club_id == existing.away_club_id:
                raise ValueError("Domaći i gostujući klub ne mogu biti isti")
        elif match_data.away_club_id is not None:
            if existing.home_club_id == match_data.away_club_id:
                raise ValueError("Domaći i gostujući klub ne mogu biti isti")

        # Ažuriraj utakmicu
        updated_match = self.repository.update(match_id, match_data)
        if not updated_match:
            return None
        
        return MatchResponse.from_orm(updated_match)

    def delete_match(self, match_id: int) -> bool:
        """Briše utakmicu ako je moguće"""
        match = self.repository.get_by_id(match_id)
        if not match:
            return False

        # Provjeri da li utakmica može biti obrisana (samo zakazane utakmice)
        if match.status != MatchStatus.SCHEDULED:
            raise ValueError("Samo zakazane utakmice mogu biti obrisane")

        return self.repository.delete(match_id)

    def change_match_status(self, match_id: int, new_status: MatchStatus) -> Optional[MatchResponse]:
        """Mijenja status utakmice"""
        match = self.repository.get_by_id(match_id)
        if not match:
            return None

        # Validacija tranzicija statusa
        if match.status == MatchStatus.COMPLETED and new_status != MatchStatus.COMPLETED:
            raise ValueError("Završene utakmice ne mogu biti promijenjene")

        if match.status == MatchStatus.IN_PROGRESS and new_status == MatchStatus.SCHEDULED:
            raise ValueError("Utakmica u toku ne može biti vraćena na zakazano")

        # Ažuriraj status
        updated_match = self.repository.change_status(match_id, new_status)
        if not updated_match:
            return None
        
        return MatchResponse.from_orm(updated_match)

    def update_match_score(self, match_id: int, home_score: int, away_score: int) -> Optional[MatchResponse]:
        """Ažurira rezultat utakmice"""
        match = self.repository.get_by_id(match_id)
        if not match:
            return None

        # Validacija rezultata
        if home_score < 0 or away_score < 0:
            raise ValueError("Rezultat ne može biti negativan")

        # Ažuriraj rezultat
        updated_match = self.repository.update_score(match_id, home_score, away_score)
        if not updated_match:
            return None
        
        return MatchResponse.from_orm(updated_match)

    def get_match_with_clubs(self, match_id: int) -> Optional[MatchWithClubsResponse]:
        """Dohvata utakmicu sa detaljnim informacijama o klubovima"""
        match_data = self.repository.get_with_clubs_detailed(match_id)
        if not match_data:
            return None
        
        return MatchWithClubsResponse(**match_data) 