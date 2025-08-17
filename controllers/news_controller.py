from fastapi import APIRouter, Depends, status, Query
from sqlmodel import Session
from database import get_session
from schemas.news_schema import NewsCreate, NewsUpdate, NewsResponse
from services.news_service import create_news_service, list_news_service, get_news_service, update_news_service, delete_news_service
from typing import List, Optional

router = APIRouter(prefix="/admin/news", tags=["news"])

@router.post("/create", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
def create_news(data: NewsCreate, session: Session = Depends(get_session)):
    return create_news_service(session, data)

@router.get("/", response_model=List[NewsResponse])
def list_news(
    limit: Optional[int] = Query(None, description="Broj vijesti za prikaz"),
    session: Session = Depends(get_session)
):
    return list_news_service(session, limit)

@router.get("/{news_id}", response_model=NewsResponse)
def get_news(news_id: int, session: Session = Depends(get_session)):
    return get_news_service(session, news_id)

@router.put("/{news_id}", response_model=NewsResponse)
def update_news(news_id: int, data: NewsUpdate, session: Session = Depends(get_session)):
    return update_news_service(session, news_id, data)

@router.delete("/{news_id}")
def delete_news(news_id: int, session: Session = Depends(get_session)):
    return delete_news_service(session, news_id) 