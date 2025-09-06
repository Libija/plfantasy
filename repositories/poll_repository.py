from sqlmodel import Session, select, func, and_
from models.poll_model import Poll, PollOption, PollVote, PollType
from models.news_model import News
from typing import List, Optional, Dict, Any
from datetime import datetime

def create_poll(session: Session, poll_data: dict, options_data: List[dict]) -> Poll:
    """Kreira novu anketu sa opcijama"""
    # Kreiraj anketu
    poll = Poll(
        news_id=poll_data.get("news_id"),
        question=poll_data["question"],
        poll_type=poll_data["poll_type"],
        is_active=poll_data.get("is_active", True)
    )
    session.add(poll)
    session.commit()
    session.refresh(poll)
    
    # Kreiraj opcije
    for i, option_data in enumerate(options_data):
        option = PollOption(
            poll_id=poll.id,
            option_text=option_data["option_text"],
            option_value=option_data.get("option_value"),
            order=i
        )
        session.add(option)
    
    session.commit()
    return poll

def get_poll_by_id(session: Session, poll_id: int) -> Optional[Poll]:
    """Dohvata anketu po ID-u sa opcijama"""
    statement = select(Poll).where(Poll.id == poll_id)
    poll = session.exec(statement).first()
    return poll

def get_polls_by_news_id(session: Session, news_id: int) -> List[Poll]:
    """Dohvata sve ankete za određenu vijest"""
    statement = select(Poll).where(Poll.news_id == news_id, Poll.is_active == True)
    polls = session.exec(statement).all()
    return polls

def get_poll_options(session: Session, poll_id: int) -> List[PollOption]:
    """Dohvata sve opcije za anketu"""
    statement = select(PollOption).where(PollOption.poll_id == poll_id).order_by(PollOption.order)
    options = session.exec(statement).all()
    return options

def get_poll_with_options(session: Session, poll_id: int) -> Optional[Dict[str, Any]]:
    """Dohvata anketu sa opcijama i brojem glasova"""
    poll = get_poll_by_id(session, poll_id)
    if not poll:
        return None
    
    options = get_poll_options(session, poll_id)
    
    # Dohvati broj glasova za svaku opciju
    options_with_votes = []
    for option in options:
        vote_count = session.exec(
            select(func.count(PollVote.id)).where(PollVote.option_id == option.id)
        ).first() or 0
        
        options_with_votes.append({
            "id": option.id,
            "poll_id": option.poll_id,
            "option_text": option.option_text,
            "option_value": option.option_value,
            "order": option.order,
            "created_at": option.created_at,
            "vote_count": vote_count
        })
    
    # Ukupan broj glasova
    total_votes = session.exec(
        select(func.count(PollVote.id)).where(PollVote.poll_id == poll_id)
    ).first() or 0
    
    return {
        "id": poll.id,
        "news_id": poll.news_id,
        "question": poll.question,
        "poll_type": poll.poll_type,
        "is_active": poll.is_active,
        "created_at": poll.created_at,
        "updated_at": poll.updated_at,
        "options": options_with_votes,
        "total_votes": total_votes
    }

def has_user_voted(session: Session, poll_id: int, user_id: int) -> bool:
    """Provjerava da li je korisnik već glasao na anketi"""
    statement = select(PollVote).where(
        and_(PollVote.poll_id == poll_id, PollVote.user_id == user_id)
    )
    vote = session.exec(statement).first()
    return vote is not None

def get_user_vote(session: Session, poll_id: int, user_id: int) -> Optional[PollVote]:
    """Dohvata glas korisnika za anketu"""
    statement = select(PollVote).where(
        and_(PollVote.poll_id == poll_id, PollVote.user_id == user_id)
    )
    vote = session.exec(statement).first()
    return vote

def create_poll_vote(session: Session, poll_id: int, user_id: int, option_id: int) -> PollVote:
    """Kreira glas za anketu"""
    # Provjeri da li je korisnik već glasao
    if has_user_voted(session, poll_id, user_id):
        raise ValueError("Korisnik je već glasao na ovoj anketi")
    
    # Provjeri da li opcija pripada anketi
    option = session.exec(select(PollOption).where(PollOption.id == option_id)).first()
    if not option or option.poll_id != poll_id:
        raise ValueError("Neispravna opcija za anketu")
    
    vote = PollVote(
        poll_id=poll_id,
        user_id=user_id,
        option_id=option_id
    )
    session.add(vote)
    session.commit()
    session.refresh(vote)
    return vote

def get_all_polls(session: Session, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Dohvata sve ankete sa opcijama i brojem glasova"""
    statement = select(Poll).where(Poll.is_active == True).offset(offset).limit(limit)
    polls = session.exec(statement).all()
    
    result = []
    for poll in polls:
        poll_data = get_poll_with_options(session, poll.id)
        if poll_data:
            result.append(poll_data)
    
    return result

def update_poll(session: Session, poll_id: int, poll_data: dict) -> Optional[Poll]:
    """Ažurira anketu"""
    statement = select(Poll).where(Poll.id == poll_id)
    poll = session.exec(statement).first()
    
    if not poll:
        return None
    
    for key, value in poll_data.items():
        if hasattr(poll, key) and value is not None:
            setattr(poll, key, value)
    
    poll.updated_at = datetime.now()
    session.add(poll)
    session.commit()
    session.refresh(poll)
    return poll

def delete_poll(session: Session, poll_id: int) -> bool:
    """Briše anketu (soft delete - postavlja is_active na False)"""
    statement = select(Poll).where(Poll.id == poll_id)
    poll = session.exec(statement).first()
    
    if not poll:
        return False
    
    poll.is_active = False
    poll.updated_at = datetime.now()
    session.add(poll)
    session.commit()
    return True

def get_polls_grouped_by_news(session: Session) -> List[dict]:
    """Dohvata sve ankete grupisano po vijestima za admin panel"""
    # Dohvati sve vijesti koje imaju ankete
    statement = select(News).join(Poll).distinct()
    news_with_polls = session.exec(statement).all()
    
    result = []
    for news in news_with_polls:
        # Dohvati sve ankete za ovu vijest
        polls_statement = select(Poll).where(Poll.news_id == news.id)
        polls = session.exec(polls_statement).all()
        
        polls_data = []
        for poll in polls:
            # Dohvati opcije i broj glasova za svaku anketu
            poll_with_options = get_poll_with_options(session, poll.id)
            if poll_with_options:
                # Dodaj prosječnu ocjenu za rating ankete
                if poll.poll_type == PollType.RATING:
                    total_votes = poll_with_options["total_votes"]
                    if total_votes > 0:
                        weighted_sum = sum(option["vote_count"] * int(option["option_text"]) for option in poll_with_options["options"])
                        average_rating = weighted_sum / total_votes
                    else:
                        average_rating = 0
                    poll_with_options["average_rating"] = average_rating
                
                polls_data.append({
                    "id": poll.id,
                    "question": poll.question,
                    "poll_type": poll.poll_type.value,
                    "is_active": poll.is_active,
                    "total_votes": poll_with_options["total_votes"],
                    "options": [
                        {
                            "id": option["id"],
                            "option_text": option["option_text"],
                            "vote_count": option["vote_count"]
                        } for option in poll_with_options["options"]
                    ],
                    "average_rating": poll_with_options.get("average_rating", 0)
                })
        
        result.append({
            "id": news.id,
            "title": news.title,
            "polls": polls_data
        })
    
    return result

def toggle_polls_by_news_id(session: Session, news_id: int, is_active: bool) -> bool:
    """Toggle aktivnost svih anketa u vijesti"""
    try:
        statement = select(Poll).where(Poll.news_id == news_id)
        polls = session.exec(statement).all()
        
        for poll in polls:
            poll.is_active = is_active
            poll.updated_at = datetime.now()
            session.add(poll)
        
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        return False
