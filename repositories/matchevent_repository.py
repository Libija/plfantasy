from typing import List, Optional
from sqlmodel import Session, select
from models.matchevent_model import MatchEvent
from schemas.matchevent_schema import MatchEventCreate, MatchEventUpdate

class MatchEventRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, event_data: MatchEventCreate) -> MatchEvent:
        """Kreira novi događaj"""
        event = MatchEvent(**event_data.dict())
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_by_id(self, event_id: int) -> Optional[MatchEvent]:
        """Dohvata događaj po ID-u"""
        return self.db.get(MatchEvent, event_id)

    def get_by_match(self, match_id: int) -> List[MatchEvent]:
        """Dohvata sve događaje za utakmicu"""
        statement = select(MatchEvent).where(MatchEvent.match_id == match_id)
        return self.db.exec(statement).all()

    def update(self, event_id: int, event_data: MatchEventUpdate) -> Optional[MatchEvent]:
        """Ažurira događaj"""
        event = self.get_by_id(event_id)
        if not event:
            return None
        
        update_data = event_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)
        
        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event_id: int) -> bool:
        """Briše događaj"""
        event = self.get_by_id(event_id)
        if not event:
            return False
        
        self.db.delete(event)
        self.db.commit()
        return True

    def delete_by_match(self, match_id: int) -> bool:
        """Briše sve događaje za utakmicu"""
        events = self.get_by_match(match_id)
        for event in events:
            self.db.delete(event)
        self.db.commit()
        return True 