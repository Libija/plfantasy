from sqlmodel import Session, select, func
from typing import List, Optional, Dict, Any
from models.match_prediction_model import MatchPrediction, PredictionType
from models.match_model import Match, MatchStatus
from models.gameweek_model import Gameweek, GameweekStatus
from models.club_model import Club
from datetime import datetime

def create_prediction(session: Session, user_id: int, match_id: int, prediction: PredictionType) -> MatchPrediction:
    """Kreira novo predviđanje ili ažurira postojeće"""
    # Provjeri da li korisnik već ima predviđanje za ovu utakmicu
    existing = session.exec(
        select(MatchPrediction).where(
            MatchPrediction.user_id == user_id,
            MatchPrediction.match_id == match_id
        )
    ).first()
    
    if existing:
        # Ažuriraj postojeće predviđanje
        existing.prediction = prediction
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    else:
        # Kreiraj novo predviđanje
        prediction_obj = MatchPrediction(
            user_id=user_id,
            match_id=match_id,
            prediction=prediction
        )
        session.add(prediction_obj)
        session.commit()
        session.refresh(prediction_obj)
        return prediction_obj

def get_user_prediction(session: Session, user_id: int, match_id: int) -> Optional[MatchPrediction]:
    """Dohvata predviđanje korisnika za određenu utakmicu"""
    return session.exec(
        select(MatchPrediction).where(
            MatchPrediction.user_id == user_id,
            MatchPrediction.match_id == match_id
        )
    ).first()

def get_current_gameweek(session: Session) -> Optional[Gameweek]:
    """Dohvata trenutno kolo - prvo IN_PROGRESS, pa SCHEDULED"""
    # Prvo pokušaj pronaći kolo u toku
    in_progress = session.exec(
        select(Gameweek).where(Gameweek.status == GameweekStatus.IN_PROGRESS)
        .order_by(Gameweek.start_date.asc())
    ).first()
    
    if in_progress:
        return in_progress
    
    # Ako nema kola u toku, uzmi prvo zakazano
    scheduled = session.exec(
        select(Gameweek).where(Gameweek.status == GameweekStatus.SCHEDULED)
        .order_by(Gameweek.start_date.asc())
    ).first()
    
    return scheduled

def get_matches_with_predictions(session: Session, gameweek_id: int, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Dohvata utakmice kola sa predviđanjima i statistikama"""
    # Dohvati utakmice kola
    matches = session.exec(
        select(Match).where(Match.gameweek_id == gameweek_id)
        .order_by(Match.date.asc())
    ).all()
    
    result = []
    for match in matches:
        # Dohvati klubove
        home_club = session.get(Club, match.home_club_id)
        away_club = session.get(Club, match.away_club_id)
        
        # Dohvati korisničko predviđanje ako je user_id dat
        user_prediction = None
        user_voted = False
        if user_id:
            user_pred = get_user_prediction(session, user_id, match.id)
            user_prediction = user_pred.prediction if user_pred else None
            user_voted = user_pred is not None
        
        # Izračunaj statistike predviđanja
        predictions = session.exec(
            select(MatchPrediction).where(MatchPrediction.match_id == match.id)
        ).all()
        
        total_predictions = len(predictions)
        stats = {
            "home_win": 0,
            "draw": 0,
            "away_win": 0
        }
        
        if total_predictions > 0:
            for pred in predictions:
                stats[pred.prediction.value] += 1
            
            # Pretvori u procente
            for key in stats:
                stats[key] = round((stats[key] / total_predictions) * 100)
        
        result.append({
            "match_id": match.id,
            "home_club_id": match.home_club_id,
            "home_club_name": home_club.name if home_club else "Unknown",
            "home_club_logo": home_club.logo_url if home_club else None,
            "away_club_id": match.away_club_id,
            "away_club_name": away_club.name if away_club else "Unknown",
            "away_club_logo": away_club.logo_url if away_club else None,
            "match_date": match.date,
            "stadium": match.stadium,
            "home_score": match.home_score,
            "away_score": match.away_score,
            "status": match.status.value,
            "user_prediction": user_prediction.value if user_prediction else None,
            "user_voted": user_voted,
            "prediction_stats": stats
        })
    
    return result

def get_gameweek_predictions(session: Session, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Dohvata predviđanja za trenutno kolo"""
    gameweek = get_current_gameweek(session)
    if not gameweek:
        return None
    
    matches = get_matches_with_predictions(session, gameweek.id, user_id)
    
    return {
        "gameweek_id": gameweek.id,
        "gameweek_number": gameweek.number,
        "gameweek_status": gameweek.status.value,
        "matches": matches,
        "can_vote": gameweek.status == GameweekStatus.SCHEDULED
    }

