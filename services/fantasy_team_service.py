from sqlmodel import Session, select
from models.fantasyteam_model import FantasyTeam
from schemas.fantasy_team_schema import FantasyTeamCreate, FantasyTeamResponse
from fastapi import HTTPException
from typing import List
from datetime import datetime

def create_fantasy_team_service(session: Session, data: FantasyTeamCreate) -> FantasyTeamResponse:
    """Kreira novi fantasy tim"""
    fantasy_team = FantasyTeam(
        user_id=data.user_id,
        name=data.name
    )
    session.add(fantasy_team)
    session.commit()
    session.refresh(fantasy_team)
    return FantasyTeamResponse.from_orm(fantasy_team)

def get_user_fantasy_teams_service(session: Session, user_id: int) -> List[FantasyTeamResponse]:
    """Dohvata fantasy timove za određenog korisnika"""
    statement = select(FantasyTeam).where(FantasyTeam.user_id == user_id)
    fantasy_teams = session.exec(statement).all()
    return [FantasyTeamResponse.from_orm(team) for team in fantasy_teams] 