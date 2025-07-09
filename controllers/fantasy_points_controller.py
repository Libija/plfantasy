from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from services.fantasy_points_service import FantasyPointsService
from typing import List

router = APIRouter(prefix="/admin/fantasy-points", tags=["fantasy-points"])

@router.post("/recalculate/match/{match_id}")
def recalculate_fantasy_points_for_match(
    match_id: int,
    db: Session = Depends(get_session)
):
    """Preračunava fantasy poene za sve igrače u utakmici na osnovu događaja"""
    try:
        service = FantasyPointsService(db)
        fantasy_points = service.calculate_fantasy_points_for_match(match_id)
        
        return {
            "message": f"Fantasy poeni su uspješno preračunati za utakmicu {match_id}",
            "fantasy_points_count": len(fantasy_points)
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri preračunavanju fantasy poena: {str(e)}") 