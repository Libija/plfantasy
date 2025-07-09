from sqlmodel import Session, select, and_
from typing import List, Optional
from datetime import datetime
from models.match_model import Match, MatchStatus
from schemas.match_schema import MatchCreate, MatchUpdate
from models.club_model import Club

class MatchRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, match_data: MatchCreate) -> Match:
        """Kreira novu utakmicu"""
        match = Match(**match_data.dict())
        self.db.add(match)
        self.db.commit()
        self.db.refresh(match)
        return match

    def get_by_id(self, match_id: int) -> Optional[Match]:
        """Dohvata utakmicu po ID-u"""
        return self.db.get(Match, match_id)

    def get_all(self, gameweek_id: Optional[int] = None, status: Optional[MatchStatus] = None) -> List[Match]:
        """Dohvata sve utakmice sa opcionalnim filterima"""
        query = select(Match)
        
        conditions = []
        if gameweek_id:
            conditions.append(Match.gameweek_id == gameweek_id)
        if status:
            conditions.append(Match.status == status)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.order_by(getattr(Match, 'date'))
        return list(self.db.exec(query))

    def get_by_gameweek(self, gameweek_id: int) -> List[Match]:
        """Dohvata sve utakmice za određeno kolo"""
        return list(self.db.exec(
            select(Match).where(Match.gameweek_id == gameweek_id).order_by(getattr(Match, 'date'))
        ))

    def update(self, match_id: int, match_data: MatchUpdate) -> Optional[Match]:
        """Ažurira postojeću utakmicu"""
        match = self.get_by_id(match_id)
        if not match:
            return None
        
        update_data = match_data.dict(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(match, field, value)
        
        self.db.commit()
        self.db.refresh(match)
        return match

    def delete(self, match_id: int) -> bool:
        """Briše utakmicu"""
        match = self.get_by_id(match_id)
        if not match:
            return False
        
        self.db.delete(match)
        self.db.commit()
        return True

    def get_with_clubs(self, gameweek_id: Optional[int] = None) -> List[dict]:
        """Dohvata utakmice sa informacijama o klubovima"""
        matches = self.get_all(gameweek_id=gameweek_id)
        result = []
        for match in matches:
            # Dohvati klubove iz baze
            home_club = self.db.get(Club, match.home_club_id)
            away_club = self.db.get(Club, match.away_club_id)
            

            result.append({
                'id': match.id,
                'home_club_id': match.home_club_id,
                'away_club_id': match.away_club_id,
                'gameweek_id': match.gameweek_id,
                'date': match.date,
                'stadium': match.stadium,
                'referee': match.referee,
                'home_score': match.home_score,
                'away_score': match.away_score,
                'status': match.status,
                'home_club_name': home_club.name if home_club else f"Klub {match.home_club_id}",
                'home_club_logo': home_club.logo_url if home_club else None,
                'away_club_name': away_club.name if away_club else f"Klub {match.away_club_id}",
                'away_club_logo': away_club.logo_url if away_club else None,
            })
        return result

    def get_with_clubs_detailed(self, match_id: int) -> Optional[dict]:
        """Dohvata utakmicu sa detaljnim informacijama o klubovima"""
        match = self.get_by_id(match_id)
        if not match:
            return None
        
        # Dohvati klubove iz baze
        home_club = self.db.get(Club, match.home_club_id)
        away_club = self.db.get(Club, match.away_club_id)
        
        # Alternativno: koristi JOIN query
        # from sqlmodel import select
        # home_club_query = select(Club).where(Club.id == match.home_club_id)
        # home_club = self.db.exec(home_club_query).first()
        # away_club_query = select(Club).where(Club.id == match.away_club_id)
        # away_club = self.db.exec(away_club_query).first()
        

        
        return {
            'id': match.id,
            'home_club_id': match.home_club_id,
            'away_club_id': match.away_club_id,
            'gameweek_id': match.gameweek_id,
            'date': match.date,
            'stadium': match.stadium,
            'referee': match.referee,
            'home_score': match.home_score,
            'away_score': match.away_score,
            'status': match.status,
            'home_club': {
                'id': match.home_club_id,
                'name': home_club.name if home_club else f"Klub {match.home_club_id}",
                'logo_url': home_club.logo_url if home_club else None
            },
            'away_club': {
                'id': match.away_club_id,
                'name': away_club.name if away_club else f"Klub {match.away_club_id}",
                'logo_url': away_club.logo_url if away_club else None
            },
            'created_at': match.created_at,
            'updated_at': match.updated_at
        }

    def update_score(self, match_id: int, home_score: int, away_score: int) -> Optional[Match]:
        """Ažurira rezultat utakmice"""
        match = self.get_by_id(match_id)
        if not match:
            return None
        
        match.home_score = home_score
        match.away_score = away_score
        match.status = MatchStatus.COMPLETED
        match.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(match)
        return match

    def change_status(self, match_id: int, new_status: MatchStatus) -> Optional[Match]:
        """Mijenja status utakmice"""
        match = self.get_by_id(match_id)
        if not match:
            return None
        
        match.status = new_status
        match.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(match)
        return match 