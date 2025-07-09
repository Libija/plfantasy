from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from models.match_lineup_model import MatchLineup
from models.player_model import Player
from models.club_model import Club
from schemas.match_lineup_schema import MatchLineupCreate, MatchLineupUpdate

class MatchLineupRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, lineup_data: MatchLineupCreate) -> MatchLineup:
        """Kreira novu postavu"""
        lineup = MatchLineup(**lineup_data.dict())
        self.db.add(lineup)
        self.db.commit()
        self.db.refresh(lineup)
        return lineup

    def get_by_id(self, lineup_id: int) -> Optional[MatchLineup]:
        """Dohvata postavu po ID-u"""
        return self.db.get(MatchLineup, lineup_id)

    def get_by_match(self, match_id: int) -> List[MatchLineup]:
        """Dohvata sve postave za utakmicu"""
        statement = select(MatchLineup).where(MatchLineup.match_id == match_id)
        return self.db.exec(statement).all()

    def get_by_match_with_players(self, match_id: int) -> List[Dict[str, Any]]:
        """Dohvata postave sa informacijama o igračima i klubovima"""
        statement = select(
            MatchLineup,
            Player.name.label("player_name"),
            Club.name.label("club_name")
        ).join(
            Player, MatchLineup.player_id == Player.id
        ).join(
            Club, MatchLineup.club_id == Club.id
        ).where(
            MatchLineup.match_id == match_id
        )
        
        results = self.db.exec(statement).all()
        
        lineups = []
        for result in results:
            lineup_dict = {
                "id": result[0].id,
                "match_id": result[0].match_id,
                "player_id": result[0].player_id,
                "player_name": result.player_name,
                "club_id": result[0].club_id,
                "club_name": result.club_name,
                "lineup_type": result[0].lineup_type,
                "shirt_number": result[0].shirt_number,
                "position": result[0].position,
                "is_captain": result[0].is_captain,
                "created_at": result[0].created_at
            }
            lineups.append(lineup_dict)
        
        return lineups

    def update(self, lineup_id: int, lineup_data: MatchLineupUpdate) -> Optional[MatchLineup]:
        """Ažurira postavu"""
        lineup = self.get_by_id(lineup_id)
        if not lineup:
            return None
        
        update_data = lineup_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(lineup, field, value)
        
        self.db.commit()
        self.db.refresh(lineup)
        return lineup

    def delete(self, lineup_id: int) -> bool:
        """Briše postavu"""
        lineup = self.get_by_id(lineup_id)
        if not lineup:
            return False
        
        self.db.delete(lineup)
        self.db.commit()
        return True

    def delete_by_match(self, match_id: int) -> bool:
        """Briše sve postave za utakmicu"""
        lineups = self.get_by_match(match_id)
        for lineup in lineups:
            self.db.delete(lineup)
        self.db.commit()
        return True 