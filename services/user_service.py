from sqlmodel import Session
from models.user_model import User, Role
from repositories.user_repository import get_user_by_username, get_user_by_email, create_user
from schemas.user_schema import UserRegisterRequest, UserLoginRequest, UserResponse
from services.jwt_service import create_access_token
from fastapi import HTTPException, status
import bcrypt
import hashlib

def hash_password(password: str) -> str:
    """
    Hashuje password koristeći bcrypt direktno.
    Ako je password duži od 72 bajta (bcrypt ograničenje),
    prvo ga hashujemo preko SHA256.
    """
    password_bytes = password.encode('utf-8')
    
    # Bcrypt ima ograničenje od 72 bajta
    if len(password_bytes) > 72:
        # Hashujemo preko SHA256 da osiguramo da je uvek manje od 72 bajta
        password_bytes = hashlib.sha256(password_bytes).digest()
    
    # Generišemo salt i hashujemo password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifikuje password koristeći bcrypt direktno.
    Ako je password duži od 72 bajta, prvo ga hashujemo preko SHA256.
    Podržava bcrypt format ($2a$, $2b$, $2y$) koji koristi i passlib.
    """
    password_bytes = plain_password.encode('utf-8')
    
    # Bcrypt ima ograničenje od 72 bajta
    if len(password_bytes) > 72:
        # Hashujemo preko SHA256 da osiguramo da je uvek manje od 72 bajta
        password_bytes = hashlib.sha256(password_bytes).digest()
    
    # Verifikujemo password
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

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