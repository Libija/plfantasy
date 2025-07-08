from sqlmodel import Session
from models.user_model import User, Role
from repositories.user_repository import get_user_by_username, get_user_by_email, create_user
from schemas.user_schema import UserRegisterRequest, UserLoginRequest, UserResponse
from services.jwt_service import create_access_token
from passlib.context import CryptContext
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def register_user(session: Session, data: UserRegisterRequest) -> UserResponse:
    if get_user_by_username(session, data.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    if get_user_by_email(session, data.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=Role.user
    )
    user = create_user(session, user)
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role
    )

def login_user(session: Session, data: UserLoginRequest):
    user = get_user_by_username(session, data.username)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)
    return user, access_token 