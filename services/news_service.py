from sqlmodel import Session
from models.news_model import News
from repositories.news_repository import create_news, get_all_news, get_news_by_id, update_news, delete_news
from repositories.comment_repository import count_comments_by_news
from schemas.news_schema import NewsCreate, NewsUpdate, NewsResponse
from fastapi import HTTPException
from typing import List, Optional

def create_news_service(session: Session, data: NewsCreate) -> NewsResponse:
    news = News(**data.dict())
    news = create_news(session, news)
    return NewsResponse.from_orm(news)

def list_news_service(session: Session, limit: Optional[int] = None) -> List[NewsResponse]:
    news_list = get_all_news(session, limit)
    result = []
    for news in news_list:
        news_dict = news.dict()
        news_dict['comments_count'] = count_comments_by_news(session, news.id)
        news_dict['total_likes_count'] = 0  # Ne koristimo više
        result.append(NewsResponse(**news_dict))
    return result

def get_news_service(session: Session, news_id: int) -> NewsResponse:
    news = get_news_by_id(session, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    news_dict = news.dict()
    news_dict['comments_count'] = count_comments_by_news(session, news_id)
    news_dict['total_likes_count'] = 0  # Ne koristimo više
    return NewsResponse(**news_dict)

def update_news_service(session: Session, news_id: int, data: NewsUpdate) -> NewsResponse:
    news = get_news_by_id(session, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(news, field, value)
    news = update_news(session, news)
    return NewsResponse.from_orm(news)

def delete_news_service(session: Session, news_id: int):
    news = get_news_by_id(session, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    delete_news(session, news)
    return {"msg": "News deleted"} 