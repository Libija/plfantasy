from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from database import get_session
from models.match_model import Match, MatchStatus
from models.club_model import Club
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/league-table", tags=["league-table"])

class ClubStanding(BaseModel):
    position: int
    club_id: int
    club_name: str
    played: int
    won: int
    drawn: int
    lost: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int

@router.get("/", response_model=List[ClubStanding])
def get_league_table(db: Session = Depends(get_session)):
    """Dohvata tabelu lige sa svim klubovima i njihovim rezultatima"""
    try:
        # Dohvati sve klubove
        clubs = db.exec(select(Club)).all()
        
        standings = []
        
        for club in clubs:
            # Dohvati sve završene utakmice za klub kao domaćin
            home_matches = db.exec(
                select(Match).where(
                    Match.home_club_id == club.id,
                    Match.status == MatchStatus.COMPLETED
                )
            ).all()
            
            # Dohvati sve završene utakmice za klub kao gost
            away_matches = db.exec(
                select(Match).where(
                    Match.away_club_id == club.id,
                    Match.status == MatchStatus.COMPLETED
                )
            ).all()
            
            # Inicijaliziraj statistiku
            played = 0
            won = 0
            drawn = 0
            lost = 0
            goals_for = 0
            goals_against = 0
            
            # Obradi domaće utakmice
            for match in home_matches:
                played += 1
                goals_for += match.home_score or 0
                goals_against += match.away_score or 0
                
                if match.home_score > match.away_score:
                    won += 1
                elif match.home_score == match.away_score:
                    drawn += 1
                else:
                    lost += 1
            
            # Obradi gostujuće utakmice
            for match in away_matches:
                played += 1
                goals_for += match.away_score or 0
                goals_against += match.home_score or 0
                
                if match.away_score > match.home_score:
                    won += 1
                elif match.away_score == match.home_score:
                    drawn += 1
                else:
                    lost += 1
            
            # Izračunaj bodove i gol razliku
            points = (won * 3) + drawn
            goal_difference = goals_for - goals_against
            
            standings.append(ClubStanding(
                position=0,  # Bit će postavljeno nakon sortiranja
                club_id=club.id,
                club_name=club.name,
                played=played,
                won=won,
                drawn=drawn,
                lost=lost,
                goals_for=goals_for,
                goals_against=goals_against,
                goal_difference=goal_difference,
                points=points
            ))
        
        # Sortiraj po bodovima (opadajuće), zatim po gol razlici (opadajuće)
        standings.sort(key=lambda x: (x.points, x.goal_difference), reverse=True)
        
        # Postavi pozicije
        for i, standing in enumerate(standings, 1):
            standing.position = i
        
        return standings
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvatanju tabele: {str(e)}") 