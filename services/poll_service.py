from sqlmodel import Session
from repositories.poll_repository import (
    create_poll, get_poll_by_id, get_polls_by_news_id, get_poll_with_options,
    has_user_voted, get_user_vote, create_poll_vote, get_all_polls,
    update_poll, delete_poll, get_polls_grouped_by_news, toggle_polls_by_news_id
)
from schemas.poll_schema import (
    PollCreate, PollResponse, PollVoteCreate, PollVoteResponse,
    RatingPollCreate, ChoicePollCreate
)
from models.poll_model import PollType
from fastapi import HTTPException
from typing import List, Dict, Any

def create_poll_service(session: Session, poll_data: PollCreate) -> PollResponse:
    """Kreira novu anketu"""
    # Pripremi podatke za kreiranje
    poll_dict = {
        "news_id": poll_data.news_id,
        "question": poll_data.question,
        "poll_type": poll_data.poll_type,
        "is_active": poll_data.is_active
    }
    
    options_dict = []
    for option in poll_data.options:
        options_dict.append({
            "option_text": option.option_text,
            "option_value": option.option_value,
            "order": option.order
        })
    
    # Kreiraj anketu
    poll = create_poll(session, poll_dict, options_dict)
    
    # Dohvati anketu sa opcijama za response
    poll_with_options = get_poll_with_options(session, poll.id)
    
    return PollResponse(
        id=poll.id,
        news_id=poll.news_id,
        question=poll.question,
        poll_type=poll.poll_type,
        is_active=poll.is_active,
        created_at=poll.created_at,
        updated_at=poll.updated_at,
        options=poll_with_options["options"],
        total_votes=poll_with_options["total_votes"],
        user_voted=False  # Novi korisnik nije glasao
    )

def create_rating_poll_service(session: Session, poll_data: RatingPollCreate) -> PollResponse:
    """Kreira anketu za ocjenu (1-5)"""
    # Automatski kreira opcije 1-5
    options = []
    for i in range(1, 6):
        options.append({
            "option_text": str(i),
            "option_value": str(i),
            "order": i - 1
        })
    
    poll_dict = {
        "news_id": poll_data.news_id,
        "question": poll_data.question,
        "poll_type": PollType.RATING,
        "is_active": True
    }
    
    poll = create_poll(session, poll_dict, options)
    poll_with_options = get_poll_with_options(session, poll.id)
    
    return PollResponse(
        id=poll.id,
        news_id=poll.news_id,
        question=poll.question,
        poll_type=poll.poll_type,
        is_active=poll.is_active,
        created_at=poll.created_at,
        updated_at=poll.updated_at,
        options=poll_with_options["options"],
        total_votes=poll_with_options["total_votes"],
        user_voted=False
    )

def create_choice_poll_service(session: Session, poll_data: ChoicePollCreate) -> PollResponse:
    """Kreira anketu za izbor između opcija"""
    options = []
    for i, option_text in enumerate(poll_data.options):
        options.append({
            "option_text": option_text,
            "option_value": None,
            "order": i
        })
    
    poll_dict = {
        "news_id": poll_data.news_id,
        "question": poll_data.question,
        "poll_type": PollType.CHOICE,
        "is_active": True
    }
    
    poll = create_poll(session, poll_dict, options)
    poll_with_options = get_poll_with_options(session, poll.id)
    
    return PollResponse(
        id=poll.id,
        news_id=poll.news_id,
        question=poll.question,
        poll_type=poll.poll_type,
        is_active=poll.is_active,
        created_at=poll.created_at,
        updated_at=poll.updated_at,
        options=poll_with_options["options"],
        total_votes=poll_with_options["total_votes"],
        user_voted=False
    )

def get_poll_service(session: Session, poll_id: int, user_id: int = None) -> PollResponse:
    """Dohvata anketu sa opcijama"""
    poll_with_options = get_poll_with_options(session, poll_id)
    
    if not poll_with_options:
        raise HTTPException(status_code=404, detail="Anketa nije pronađena")
    
    # Provjeri da li je korisnik glasao
    user_voted = False
    if user_id:
        user_voted = has_user_voted(session, poll_id, user_id)
    
    return PollResponse(
        id=poll_with_options["id"],
        news_id=poll_with_options["news_id"],
        question=poll_with_options["question"],
        poll_type=poll_with_options["poll_type"],
        is_active=poll_with_options["is_active"],
        created_at=poll_with_options["created_at"],
        updated_at=poll_with_options["updated_at"],
        options=poll_with_options["options"],
        total_votes=poll_with_options["total_votes"],
        user_voted=user_voted
    )

def get_polls_by_news_service(session: Session, news_id: int, user_id: int = None) -> List[PollResponse]:
    """Dohvata sve ankete za vijest"""
    polls = get_polls_by_news_id(session, news_id)
    result = []
    
    # Proveri da li je korisnik glasao na svim anketama
    all_polls_voted = True
    if user_id and polls:
        for poll in polls:
            if not has_user_voted(session, poll.id, user_id):
                all_polls_voted = False
                break
    else:
        all_polls_voted = False
    
    for poll in polls:
        poll_with_options = get_poll_with_options(session, poll.id)
        if poll_with_options:
            user_voted = False
            if user_id:
                user_voted = has_user_voted(session, poll.id, user_id)
            
            result.append(PollResponse(
                id=poll_with_options["id"],
                news_id=poll_with_options["news_id"],
                question=poll_with_options["question"],
                poll_type=poll_with_options["poll_type"],
                is_active=poll_with_options["is_active"],
                created_at=poll_with_options["created_at"],
                updated_at=poll_with_options["updated_at"],
                options=poll_with_options["options"],
                total_votes=poll_with_options["total_votes"],
                user_voted=user_voted,
                all_polls_voted=all_polls_voted
            ))
    
    return result

def vote_poll_service(session: Session, poll_id: int, user_id: int, vote_data: PollVoteCreate) -> PollVoteResponse:
    """Glasa na anketi"""
    try:
        vote = create_poll_vote(session, poll_id, user_id, vote_data.option_id)
        return PollVoteResponse(
            id=vote.id,
            poll_id=vote.poll_id,
            user_id=vote.user_id,
            option_id=vote.option_id,
            voted_at=vote.voted_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

def get_all_polls_service(session: Session, user_id: int = None, limit: int = 50, offset: int = 0) -> List[PollResponse]:
    """Dohvata sve ankete"""
    polls_data = get_all_polls(session, limit, offset)
    result = []
    
    for poll_data in polls_data:
        user_voted = False
        if user_id:
            user_voted = has_user_voted(session, poll_data["id"], user_id)
        
        result.append(PollResponse(
            id=poll_data["id"],
            news_id=poll_data["news_id"],
            question=poll_data["question"],
            poll_type=poll_data["poll_type"],
            is_active=poll_data["is_active"],
            created_at=poll_data["created_at"],
            updated_at=poll_data["updated_at"],
            options=poll_data["options"],
            total_votes=poll_data["total_votes"],
            user_voted=user_voted
        ))
    
    return result

def update_poll_service(session: Session, poll_id: int, poll_data: dict) -> PollResponse:
    """Ažurira anketu"""
    poll = update_poll(session, poll_id, poll_data)
    
    if not poll:
        raise HTTPException(status_code=404, detail="Anketa nije pronađena")
    
    poll_with_options = get_poll_with_options(session, poll.id)
    
    return PollResponse(
        id=poll_with_options["id"],
        news_id=poll_with_options["news_id"],
        question=poll_with_options["question"],
        poll_type=poll_with_options["poll_type"],
        is_active=poll_with_options["is_active"],
        created_at=poll_with_options["created_at"],
        updated_at=poll_with_options["updated_at"],
        options=poll_with_options["options"],
        total_votes=poll_with_options["total_votes"],
        user_voted=False
    )

def delete_poll_service(session: Session, poll_id: int) -> bool:
    """Briše anketu"""
    return delete_poll(session, poll_id)

def get_admin_polls_service(session: Session) -> List[dict]:
    """Dohvata sve ankete grupisano po vijestima za admin panel"""
    return get_polls_grouped_by_news(session)

def toggle_news_polls_service(session: Session, news_id: int, is_active: bool) -> dict:
    """Toggle aktivnost svih anketa u vijesti"""
    success = toggle_polls_by_news_id(session, news_id, is_active)
    return {"success": success, "message": f"Ankete {'aktivirane' if is_active else 'deaktivirane'}"}
