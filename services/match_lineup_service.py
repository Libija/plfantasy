from typing import List, Optional
from sqlmodel import Session
from schemas.match_lineup_schema import MatchLineupCreate, MatchLineupUpdate, MatchLineupResponse, MatchLineupWithPlayerResponse
from repositories.match_lineup_repository import MatchLineupRepository

class MatchLineupService:
    def __init__(self, db: Session):
        self.repository = MatchLineupRepository(db)

    def create_lineup(self, lineup_data: MatchLineupCreate) -> MatchLineupResponse:
        """Kreira novu postavu"""
        lineup = self.repository.create(lineup_data)
        return MatchLineupResponse.from_orm(lineup)

    def get_lineup(self, lineup_id: int) -> Optional[MatchLineupResponse]:
        """Dohvata postavu po ID-u"""
        lineup = self.repository.get_by_id(lineup_id)
        if not lineup:
            return None
        return MatchLineupResponse.from_orm(lineup)

    def get_match_lineups(self, match_id: int) -> List[MatchLineupWithPlayerResponse]:
        """Dohvata sve postave za utakmicu sa informacijama o igračima"""
        lineups_data = self.repository.get_by_match_with_players(match_id)
        return [MatchLineupWithPlayerResponse(**data) for data in lineups_data]

    def update_lineup(self, lineup_id: int, lineup_data: MatchLineupUpdate) -> Optional[MatchLineupResponse]:
        """Ažurira postavu"""
        lineup = self.repository.update(lineup_id, lineup_data)
        if not lineup:
            return None
        return MatchLineupResponse.from_orm(lineup)

    def delete_lineup(self, lineup_id: int) -> bool:
        """Briše postavu"""
        return self.repository.delete(lineup_id)

    def delete_match_lineups(self, match_id: int) -> bool:
        """Briše sve postave za utakmicu"""
        return self.repository.delete_by_match(match_id)

    def create_bulk_lineups(self, match_id: int, lineups_data: List[MatchLineupCreate]) -> List[MatchLineupResponse]:
        """Kreira više postava odjednom"""
        created_lineups = []
        for lineup_data in lineups_data:
            lineup_data.match_id = match_id  # Osiguraj da je match_id postavljen
            lineup = self.repository.create(lineup_data)
            created_lineups.append(MatchLineupResponse.from_orm(lineup))
        return created_lineups 