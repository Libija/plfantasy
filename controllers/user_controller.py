from fastapi import APIRouter, Depends, status, Request
from sqlmodel import Session
from database import get_session
from schemas.user_schema import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from services.user_service import register_user, login_user

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
