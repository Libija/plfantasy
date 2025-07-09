from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from models.match_substitution_model import MatchSubstitution
from models.player_model import Player
from models.club_model import Club
from schemas.match_substitution_schema import MatchSubstitutionCreate, MatchSubstitutionUpdate

class MatchSubstitutionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, substitution_data: MatchSubstitutionCreate) -> MatchSubstitution:
        """Kreira novu izmjenu"""
        substitution = MatchSubstitution(**substitution_data.dict())
        self.db.add(substitution)
        self.db.commit()
        self.db.refresh(substitution)
        return substitution

    def get_by_id(self, substitution_id: int) -> Optional[MatchSubstitution]:
        """Dohvata izmjenu po ID-u"""
        return self.db.get(MatchSubstitution, substitution_id)

    def get_by_match(self, match_id: int) -> List[MatchSubstitution]:
        """Dohvata sve izmjene za utakmicu"""
        statement = select(MatchSubstitution).where(MatchSubstitution.match_id == match_id)
        return self.db.exec(statement).all()

    def get_by_match_with_players(self, match_id: int) -> List[Dict[str, Any]]:
        """Dohvata izmjene sa informacijama o igračima i klubovima"""
        statement = select(
            MatchSubstitution,
            Club.name.label("club_name"),
            Player.name.label("player_out_name")
        ).join(
            Club, MatchSubstitution.club_id == Club.id
        ).join(
            Player, MatchSubstitution.player_out_id == Player.id, isouter=True
        ).where(
            MatchSubstitution.match_id == match_id
        )
        
        results = self.db.exec(statement).all()
        
        substitutions = []
        for result in results:
            # Dohvati ime igrača koji ulazi
            player_in = self.db.get(Player, result[0].player_in_id)
            player_in_name = player_in.name if player_in else "Nepoznat igrač"
            
            substitution_dict = {
                "id": result[0].id,
                "match_id": result[0].match_id,
                "club_id": result[0].club_id,
                "club_name": result.club_name,
                "player_out_id": result[0].player_out_id,
                "player_out_name": result.player_out_name or "Nepoznat igrač",
                "player_in_id": result[0].player_in_id,
                "player_in_name": player_in_name,
                "minute": result[0].minute,
                "created_at": result[0].created_at
            }
            substitutions.append(substitution_dict)
        
        return substitutions

    def update(self, substitution_id: int, substitution_data: MatchSubstitutionUpdate) -> Optional[MatchSubstitution]:
        """Ažurira izmjenu"""
        substitution = self.get_by_id(substitution_id)
        if not substitution:
            return None
        
        update_data = substitution_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(substitution, field, value)
        
        self.db.commit()
        self.db.refresh(substitution)
        return substitution

    def delete(self, substitution_id: int) -> bool:
        """Briše izmjenu"""
        substitution = self.get_by_id(substitution_id)
        if not substitution:
            return False
        
        self.db.delete(substitution)
        self.db.commit()
        return True

    def delete_by_match(self, match_id: int) -> bool:
        """Briše sve izmjene za utakmicu"""
        substitutions = self.get_by_match(match_id)
        for substitution in substitutions:
            self.db.delete(substitution)
        self.db.commit()
        return True 