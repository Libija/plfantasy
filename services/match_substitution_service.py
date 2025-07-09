from typing import List, Optional
from sqlmodel import Session
from schemas.match_substitution_schema import MatchSubstitutionCreate, MatchSubstitutionUpdate, MatchSubstitutionResponse, MatchSubstitutionWithPlayersResponse
from repositories.match_substitution_repository import MatchSubstitutionRepository

class MatchSubstitutionService:
    def __init__(self, db: Session):
        self.repository = MatchSubstitutionRepository(db)

    def create_substitution(self, substitution_data: MatchSubstitutionCreate) -> MatchSubstitutionResponse:
        """Kreira novu izmjenu"""
        substitution = self.repository.create(substitution_data)
        return MatchSubstitutionResponse.from_orm(substitution)

    def get_substitution(self, substitution_id: int) -> Optional[MatchSubstitutionResponse]:
        """Dohvata izmjenu po ID-u"""
        substitution = self.repository.get_by_id(substitution_id)
        if not substitution:
            return None
        return MatchSubstitutionResponse.from_orm(substitution)

    def get_match_substitutions(self, match_id: int) -> List[MatchSubstitutionWithPlayersResponse]:
        """Dohvata sve izmjene za utakmicu sa informacijama o igračima"""
        substitutions_data = self.repository.get_by_match_with_players(match_id)
        return [MatchSubstitutionWithPlayersResponse(**data) for data in substitutions_data]

    def update_substitution(self, substitution_id: int, substitution_data: MatchSubstitutionUpdate) -> Optional[MatchSubstitutionResponse]:
        """Ažurira izmjenu"""
        substitution = self.repository.update(substitution_id, substitution_data)
        if not substitution:
            return None
        return MatchSubstitutionResponse.from_orm(substitution)

    def delete_substitution(self, substitution_id: int) -> bool:
        """Briše izmjenu"""
        return self.repository.delete(substitution_id)

    def delete_match_substitutions(self, match_id: int) -> bool:
        """Briše sve izmjene za utakmicu"""
        return self.repository.delete_by_match(match_id)

    def create_bulk_substitutions(self, match_id: int, substitutions_data: List[MatchSubstitutionCreate]) -> List[MatchSubstitutionResponse]:
        """Kreira više izmjena odjednom"""
        created_substitutions = []
        for substitution_data in substitutions_data:
            substitution_data.match_id = match_id  # Osiguraj da je match_id postavljen
            substitution = self.repository.create(substitution_data)
            created_substitutions.append(MatchSubstitutionResponse.from_orm(substitution))
        return created_substitutions 