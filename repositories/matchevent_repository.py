from typing import List, Optional
from sqlmodel import Session, select
from models.matchevent_model import MatchEvent
from models.player_model import Player
from models.club_model import Club
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
        return list(self.db.exec(statement).all())

    def get_by_match_with_players(self, match_id: int) -> List[dict]:
        """Dohvata sve događaje za utakmicu sa imenima igrača i klubova"""
        statement = select(MatchEvent).where(MatchEvent.match_id == match_id)
        events = list(self.db.exec(statement).all())
        
        result = []
        for event in events:
            event_dict = {
                "id": event.id,
                "match_id": event.match_id,
                "player_id": event.player_id,
                "event_type": event.event_type,
                "minute": event.minute,
                "assist_player_id": event.assist_player_id,
                "created_at": event.created_at
            }
            
            # Dohvati igrača
            player = self.db.get(Player, event.player_id)
            if player:
                event_dict["player_name"] = player.name
                # Dohvati klub
                club = self.db.get(Club, player.club_id)
                if club:
                    event_dict["club_name"] = club.name
            
            # Dohvati asistenta ako postoji
            if event.assist_player_id:
                assist_player = self.db.get(Player, event.assist_player_id)
                if assist_player:
                    event_dict["assist_player_name"] = assist_player.name
            
            result.append(event_dict)
        
        return result

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