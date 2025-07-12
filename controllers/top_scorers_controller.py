from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from database import get_session
from models.matchevent_model import MatchEvent, MatchEventType
from models.player_model import Player
from models.club_model import Club
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/top-scorers", tags=["top-scorers"])

class TopScorer(BaseModel):
    position: int
    player_id: int
    player_name: str
    club_name: str
    goals: int

@router.get("/", response_model=List[TopScorer])
def get_top_scorers(limit: int = 5, db: Session = Depends(get_session)):
    """Dohvata najbolje strijelce sa brojem golova"""
    try:
        # Dohvati sve golove (goal events) sa informacijama o igračima i klubovima
        goals_query = (
            select(
                MatchEvent.player_id,
                Player.name.label("player_name"),
                Club.name.label("club_name"),
                func.count(MatchEvent.id).label("goals")
            )
            .join(Player, MatchEvent.player_id == Player.id)
            .join(Club, Player.club_id == Club.id)
            .where(MatchEvent.event_type == MatchEventType.goal)
            .group_by(MatchEvent.player_id, Player.name, Club.name)
            .order_by(func.count(MatchEvent.id).desc())
            .limit(limit)
        )
        
        results = db.exec(goals_query).all()
        
        top_scorers = []
        for i, result in enumerate(results, 1):
            top_scorers.append(TopScorer(
                position=i,
                player_id=result.player_id,
                player_name=result.player_name,
                club_name=result.club_name,
                goals=result.goals
            ))
        
        return top_scorers
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvatanju najboljih strijelaca: {str(e)}") 