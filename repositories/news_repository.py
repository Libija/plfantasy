from sqlmodel import Session, select
from models.news_model import News
from typing import List, Optional

def create_news(session: Session, news: News) -> News:
    session.add(news)
    session.commit()
    session.refresh(news)
    return news

def get_all_news(session: Session, limit: Optional[int] = None) -> List[News]:
    query = select(News).order_by(News.date_posted.desc())
    if limit:
        query = query.limit(limit)
    return session.exec(query).all()

def get_news_by_id(session: Session, news_id: int) -> Optional[News]:
    return session.get(News, news_id)

def update_news(session: Session, news: News) -> News:
    session.add(news)
    session.commit()
    session.refresh(news)
    return news

def delete_news(session: Session, news: News):
    session.delete(news)
    session.commit() 