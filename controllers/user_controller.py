from fastapi import APIRouter, Depends, status, Request, HTTPException, Header
from sqlmodel import Session, select
from database import get_session
from schemas.user_schema import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from services.user_service import register_user, login_user
from services.jwt_service import verify_access_token
from models.user_model import User
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegisterRequest, session: Session = Depends(get_session)):
    return register_user(session, data)

@router.post("/login", response_model=TokenResponse)
def login(data: UserLoginRequest, session: Session = Depends(get_session)):
    user, token = login_user(session, data)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role
        )
    )

@router.post("/logout")
def logout():
    # Logout je na frontendu (brisanje tokena), backend može vratiti 200 OK
    return {"msg": "Logged out"}

def get_current_user_token(authorization: Optional[str] = Header(None)):
    """Dohvata i verifikuje JWT token iz Authorization header-a"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header je potreban")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Nevaljan format tokena")
    
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Nevaljan token")
    
    return payload

@router.get("/me", response_model=UserResponse)
def get_current_user(token: dict = Depends(get_current_user_token), session: Session = Depends(get_session)):
    """Dohvata trenutnog korisnika na osnovu JWT tokena"""
    user_id = token.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token ne sadrži user_id")
    
    user = session.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role
    )

# Admin endpointi
admin_router = APIRouter(prefix="/admin", tags=["admin"])

@admin_router.get("/users")
def get_all_users(session: Session = Depends(get_session)):
    """Dohvata sve korisnike (admin)"""
    users = session.exec(select(User)).all()
    return users
