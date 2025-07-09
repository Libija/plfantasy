from sqlmodel import Session, select, and_
from typing import List, Optional
from datetime import datetime
from models.gameweek_model import Gameweek, GameweekStatus
from schemas.gameweek_schema import GameweekCreate, GameweekUpdate
from models.match_model import Match

class GameweekRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, gameweek_data: GameweekCreate) -> Gameweek:
        """Kreira novo kolo"""
        gameweek = Gameweek(**gameweek_data.dict())
        self.db.add(gameweek)
        self.db.commit()
        self.db.refresh(gameweek)
        return gameweek

    def get_by_id(self, gameweek_id: int) -> Optional[Gameweek]:
        """Dohvata kolo po ID-u"""
        return self.db.get(Gameweek, gameweek_id)

    def get_all(self, season: Optional[str] = None, status: Optional[GameweekStatus] = None) -> List[Gameweek]:
        """Dohvata sva kola sa opcionalnim filterima"""
        query = select(Gameweek)
        
        conditions = []
        if season:
            conditions.append(Gameweek.season == season)
        if status:
            conditions.append(Gameweek.status == status)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.order_by(Gameweek.number)
        return self.db.exec(query).all()

    def get_by_number_and_season(self, number: int, season: str) -> Optional[Gameweek]:
        """Dohvata kolo po broju i sezoni"""
        return self.db.exec(
            select(Gameweek).where(
                and_(Gameweek.number == number, Gameweek.season == season)
            )
        ).first()

    def update(self, gameweek_id: int, gameweek_data: GameweekUpdate) -> Optional[Gameweek]:
        """Ažurira postojeće kolo"""
        gameweek = self.get_by_id(gameweek_id)
        if not gameweek:
            return None
        
        update_data = gameweek_data.dict(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(gameweek, field, value)
        
        self.db.commit()
        self.db.refresh(gameweek)
        return gameweek

    def delete(self, gameweek_id: int) -> bool:
        """Briše kolo"""
        gameweek = self.get_by_id(gameweek_id)
        if not gameweek:
            return False
        
        self.db.delete(gameweek)
        self.db.commit()
        return True

    def check_date_overlap(self, start_date: datetime, end_date: datetime, 
                          season: str, exclude_id: Optional[int] = None) -> bool:
        """Provjerava da li se datumi preklapaju sa postojećim kolima"""
        query = select(Gameweek).where(
            and_(
                Gameweek.season == season,
                Gameweek.start_date <= end_date,
                Gameweek.end_date >= start_date
            )
        )
        
        if exclude_id:
            query = query.where(Gameweek.id != exclude_id)
        
        overlapping = self.db.exec(query).first()
        return overlapping is not None

    def get_with_match_count(self, season: Optional[str] = None) -> List[dict]:
        gameweeks = self.get_all(season=season)
        result = []
        for gameweek in gameweeks:
            # Prebroji utakmice za ovo kolo
            match_count = len(list(self.db.exec(
                select(Match).where(Match.gameweek_id == gameweek.id)
            )))
            result.append({
                'id': gameweek.id,
                'number': gameweek.number,
                'season': gameweek.season,
                'start_date': gameweek.start_date,
                'end_date': gameweek.end_date,
                'status': gameweek.status,
                'match_count': match_count
            })
        return result 