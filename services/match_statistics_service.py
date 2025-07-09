from typing import List, Optional
from sqlmodel import Session
from schemas.match_statistics_schema import MatchStatisticsCreate, MatchStatisticsUpdate, MatchStatisticsResponse, MatchStatisticsWithClubResponse
from repositories.match_statistics_repository import MatchStatisticsRepository

class MatchStatisticsService:
    def __init__(self, db: Session):
        self.repository = MatchStatisticsRepository(db)

    def create_statistics(self, statistics_data: MatchStatisticsCreate) -> MatchStatisticsResponse:
        """Kreira nove statistike"""
        statistics = self.repository.create(statistics_data)
        return MatchStatisticsResponse.from_orm(statistics)

    def get_statistics(self, statistics_id: int) -> Optional[MatchStatisticsResponse]:
        """Dohvata statistike po ID-u"""
        statistics = self.repository.get_by_id(statistics_id)
        if not statistics:
            return None
        return MatchStatisticsResponse.from_orm(statistics)

    def get_match_statistics(self, match_id: int) -> List[MatchStatisticsWithClubResponse]:
        """Dohvata sve statistike za utakmicu sa informacijama o klubovima"""
        statistics_data = self.repository.get_by_match_with_clubs(match_id)
        return [MatchStatisticsWithClubResponse(**data) for data in statistics_data]

    def get_club_statistics(self, match_id: int, club_id: int) -> Optional[MatchStatisticsResponse]:
        """Dohvata statistike za određeni klub u utakmici"""
        statistics = self.repository.get_by_match_and_club(match_id, club_id)
        if not statistics:
            return None
        return MatchStatisticsResponse.from_orm(statistics)

    def update_statistics(self, statistics_id: int, statistics_data: MatchStatisticsUpdate) -> Optional[MatchStatisticsResponse]:
        """Ažurira statistike"""
        statistics = self.repository.update(statistics_id, statistics_data)
        if not statistics:
            return None
        return MatchStatisticsResponse.from_orm(statistics)

    def update_or_create_statistics(self, match_id: int, club_id: int, statistics_data: MatchStatisticsUpdate) -> MatchStatisticsResponse:
        """Ažurira postojeće ili kreira nove statistike"""
        statistics = self.repository.update_or_create(match_id, club_id, statistics_data)
        return MatchStatisticsResponse.from_orm(statistics)

    def delete_statistics(self, statistics_id: int) -> bool:
        """Briše statistike"""
        return self.repository.delete(statistics_id)

    def delete_match_statistics(self, match_id: int) -> bool:
        """Briše sve statistike za utakmicu"""
        return self.repository.delete_by_match(match_id)

    def create_bulk_statistics(self, match_id: int, statistics_data: List[MatchStatisticsCreate]) -> List[MatchStatisticsResponse]:
        """Kreira statistike za više klubova odjednom"""
        created_statistics = []
        for stat_data in statistics_data:
            stat_data.match_id = match_id  # Osiguraj da je match_id postavljen
            statistics = self.repository.create(stat_data)
            created_statistics.append(MatchStatisticsResponse.from_orm(statistics))
        return created_statistics 