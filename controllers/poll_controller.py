from fastapi import APIRouter, Depends, status, HTTPException, Header
from sqlmodel import Session
from database import get_session
from schemas.poll_schema import (
    PollCreate, PollResponse, PollVoteCreate, PollVoteResponse,
    RatingPollCreate, ChoicePollCreate
)
from services.poll_service import (
    create_poll_service, create_rating_poll_service, create_choice_poll_service,
    get_poll_service, get_polls_by_news_service, vote_poll_service,
    get_all_polls_service, update_poll_service, delete_poll_service,
    get_admin_polls_service, toggle_news_polls_service
)
from services.jwt_service import verify_access_token
from typing import List, Optional

router = APIRouter(prefix="/admin/polls", tags=["admin-polls"])
public_router = APIRouter(prefix="/polls", tags=["public-polls"])

def get_current_user_id(authorization: Optional[str] = Header(None)):
    """Dohvata user_id iz JWT tokena"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header je potreban")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Nevaljan format tokena")
    
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Nevaljan token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token ne sadrži user_id")
    
    return int(user_id)

# Admin endpointi
@router.post("/", response_model=PollResponse, status_code=status.HTTP_201_CREATED)
def create_poll(poll_data: PollCreate, session: Session = Depends(get_session)):
    """Kreira novu anketu (admin)"""
    return create_poll_service(session, poll_data)

@router.post("/rating", response_model=PollResponse, status_code=status.HTTP_201_CREATED)
def create_rating_poll(poll_data: RatingPollCreate, session: Session = Depends(get_session)):
    """Kreira anketu za ocjenu 1-5 (admin)"""
    return create_rating_poll_service(session, poll_data)

@router.post("/choice", response_model=PollResponse, status_code=status.HTTP_201_CREATED)
def create_choice_poll(poll_data: ChoicePollCreate, session: Session = Depends(get_session)):
    """Kreira anketu za izbor između opcija (admin)"""
    return create_choice_poll_service(session, poll_data)

@router.get("/list", response_model=List[PollResponse])
def get_all_polls(
    limit: int = 50, 
    offset: int = 0, 
    session: Session = Depends(get_session)
):
    """Dohvata sve ankete (admin)"""
    return get_all_polls_service(session, None, limit, offset)

@router.get("/{poll_id}", response_model=PollResponse)
def get_poll(poll_id: int, session: Session = Depends(get_session)):
    """Dohvata anketu po ID-u (admin)"""
    return get_poll_service(session, poll_id)

@router.put("/{poll_id}", response_model=PollResponse)
def update_poll(poll_id: int, poll_data: dict, session: Session = Depends(get_session)):
    """Ažurira anketu (admin)"""
    return update_poll_service(session, poll_id, poll_data)

@router.delete("/{poll_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_poll(poll_id: int, session: Session = Depends(get_session)):
    """Briše anketu (admin)"""
    delete_poll_service(session, poll_id)
    return None

# Javni endpointi
@public_router.get("/", response_model=List[PollResponse])
def get_public_polls(
    limit: int = 20, 
    offset: int = 0, 
    session: Session = Depends(get_session)
):
    """Dohvata sve javne ankete"""
    return get_all_polls_service(session, None, limit, offset)

@public_router.get("/{poll_id}", response_model=PollResponse)
def get_public_poll(poll_id: int, session: Session = Depends(get_session)):
    """Dohvata anketu po ID-u (javno)"""
    return get_poll_service(session, poll_id)

@public_router.get("/news/{news_id}", response_model=List[PollResponse])
def get_polls_by_news(
    news_id: int, 
    session: Session = Depends(get_session),
    authorization: Optional[str] = Header(None)
):
    """Dohvata ankete za vijest (javno)"""
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            payload = verify_access_token(token)
            user_id = payload.get("sub")
        except:
            pass  # Ignoriši grešku ako token nije valjan
    
    return get_polls_by_news_service(session, news_id, user_id)

@public_router.post("/{poll_id}/vote", response_model=PollVoteResponse)
def vote_poll(
    poll_id: int, 
    vote_data: PollVoteCreate, 
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Glasa na anketi (javno) - samo logovani korisnici"""
    return vote_poll_service(session, poll_id, user_id, vote_data)

# Endpoint za dohvaćanje ankete sa informacijom o tome da li je korisnik glasao
@public_router.get("/{poll_id}/user/{user_id}", response_model=PollResponse)
def get_poll_for_user(poll_id: int, user_id: int, session: Session = Depends(get_session)):
    """Dohvata anketu sa informacijom da li je korisnik glasao"""
    return get_poll_service(session, poll_id, user_id)

# Admin endpointi za upravljanje anketama
@router.get("/", response_model=List[dict])
def get_admin_polls(session: Session = Depends(get_session)):
    """Dohvata sve ankete grupisano po vijestima za admin panel"""
    return get_admin_polls_service(session)

@router.post("/news/{news_id}/toggle")
def toggle_news_polls(news_id: int, toggle_data: dict, session: Session = Depends(get_session)):
    """Toggle aktivnost svih anketa u vijesti"""
    is_active = toggle_data.get("is_active", False)
    return toggle_news_polls_service(session, news_id, is_active)
