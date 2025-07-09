from typing import List, Optional
from sqlmodel import Session
from schemas.matchevent_schema import MatchEventCreate, MatchEventUpdate, MatchEventResponse
from repositories.matchevent_repository import MatchEventRepository

class MatchEventService:
    def __init__(self, db: Session):
        self.repository = MatchEventRepository(db)

    def create_event(self, event_data: MatchEventCreate) -> MatchEventResponse:
        """Kreira novi događaj"""
        event = self.repository.create(event_data)
        return MatchEventResponse.from_orm(event)

    def get_event(self, event_id: int) -> Optional[MatchEventResponse]:
        """Dohvata događaj po ID-u"""
        event = self.repository.get_by_id(event_id)
        if not event:
            return None
        return MatchEventResponse.from_orm(event)

    def get_match_events(self, match_id: int) -> List[MatchEventResponse]:
        """Dohvata sve događaje za utakmicu"""
        events = self.repository.get_by_match(match_id)
        return [MatchEventResponse.from_orm(event) for event in events]

    def update_event(self, event_id: int, event_data: MatchEventUpdate) -> Optional[MatchEventResponse]:
        """Ažurira događaj"""
        event = self.repository.update(event_id, event_data)
        if not event:
            return None
        return MatchEventResponse.from_orm(event)

    def delete_event(self, event_id: int) -> bool:
        """Briše događaj"""
        return self.repository.delete(event_id)

    def delete_match_events(self, match_id: int) -> bool:
        """Briše sve događaje za utakmicu"""
        return self.repository.delete_by_match(match_id) 