from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from models.match_statistics_model import MatchStatistics
from models.club_model import Club
from schemas.match_statistics_schema import MatchStatisticsCreate, MatchStatisticsUpdate

class MatchStatisticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, statistics_data: MatchStatisticsCreate) -> MatchStatistics:
        """Kreira nove statistike"""
        statistics = MatchStatistics(**statistics_data.dict())
        self.db.add(statistics)
        self.db.commit()
        self.db.refresh(statistics)
        return statistics

    def get_by_id(self, statistics_id: int) -> Optional[MatchStatistics]:
        """Dohvata statistike po ID-u"""
        return self.db.get(MatchStatistics, statistics_id)

    def get_by_match(self, match_id: int) -> List[MatchStatistics]:
        """Dohvata sve statistike za utakmicu"""
        statement = select(MatchStatistics).where(MatchStatistics.match_id == match_id)
        return self.db.exec(statement).all()

    def get_by_match_with_clubs(self, match_id: int) -> List[Dict[str, Any]]:
        """Dohvata statistike sa informacijama o klubovima"""
        statement = select(
            MatchStatistics,
            Club.name.label("club_name")
        ).join(
            Club, MatchStatistics.club_id == Club.id
        ).where(
            MatchStatistics.match_id == match_id
        )
        
        results = self.db.exec(statement).all()
        
        statistics = []
        for result in results:
            stats_dict = {
                "id": result[0].id,
                "match_id": result[0].match_id,
                "club_id": result[0].club_id,
                "club_name": result.club_name,
                "possession": result[0].possession,
                "shots": result[0].shots,
                "shots_on_target": result[0].shots_on_target,
                "corners": result[0].corners,
                "fouls": result[0].fouls,
                "yellow_cards": result[0].yellow_cards,
                "red_cards": result[0].red_cards,
                "offsides": result[0].offsides,
                "created_at": result[0].created_at,
                "updated_at": result[0].updated_at
            }
            statistics.append(stats_dict)
        
        return statistics

    def get_by_match_and_club(self, match_id: int, club_id: int) -> Optional[MatchStatistics]:
        """Dohvata statistike za određeni klub u utakmici"""
        statement = select(MatchStatistics).where(
            MatchStatistics.match_id == match_id,
            MatchStatistics.club_id == club_id
        )
        return self.db.exec(statement).first()

    def update(self, statistics_id: int, statistics_data: MatchStatisticsUpdate) -> Optional[MatchStatistics]:
        """Ažurira statistike"""
        statistics = self.get_by_id(statistics_id)
        if not statistics:
            return None
        
        update_data = statistics_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(statistics, field, value)
        
        self.db.commit()
        self.db.refresh(statistics)
        return statistics

    def update_or_create(self, match_id: int, club_id: int, statistics_data: MatchStatisticsUpdate) -> MatchStatistics:
        """Ažurira postojeće ili kreira nove statistike"""
        existing = self.get_by_match_and_club(match_id, club_id)
        
        if existing:
            update_data = statistics_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(existing, field, value)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            # Kreiraj nove statistike
            create_data = {
                "match_id": match_id,
                "club_id": club_id,
                **statistics_data.dict()
            }
            return self.create(MatchStatisticsCreate(**create_data))

    def delete(self, statistics_id: int) -> bool:
        """Briše statistike"""
        statistics = self.get_by_id(statistics_id)
        if not statistics:
            return False
        
        self.db.delete(statistics)
        self.db.commit()
        return True

    def delete_by_match(self, match_id: int) -> bool:
        """Briše sve statistike za utakmicu"""
        statistics = self.get_by_match(match_id)
        for stat in statistics:
            self.db.delete(stat)
        self.db.commit()
        return True 