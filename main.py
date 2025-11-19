from contextlib import asynccontextmanager
from typing import Annotated
from database import engine
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select
from starlette.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
import sys


def create_db_and_tables():
    
    SQLModel.metadata.create_all(engine)
    print("✅ Baza i tabele su spremne!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    
    create_db_and_tables()
    yield
    print("🛑 Gašenje aplikacije...")


def start_application():
    app = FastAPI(lifespan=lifespan)

    origins = ["http://localhost:3000"]  # ✅ DOZVOLJENO ZA FRONTEND

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"]
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        print("\n[VALIDATION ERROR]", file=sys.stderr)
        print(exc.errors(), file=sys.stderr)
        print("Body:", await request.body(), file=sys.stderr)
        response = JSONResponse(
            status_code=422,
            content={"detail": [{"loc": error["loc"], "msg": error["msg"]} for error in exc.errors()]},
        )
        # Dodaj CORS headere
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Log samo tip greške, ne full stack trace za Aiven free tier
        print(f"[ERROR] {type(exc).__name__}: {str(exc)}")
        response = JSONResponse(
            status_code=500,
            content={"detail": "Server error - please try again"}
        )
        # Dodaj CORS headere
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response


    return app



app = start_application()

from controllers import user_controller
app.include_router(user_controller.router)
app.include_router(user_controller.admin_router)
from controllers import club_controller
app.include_router(club_controller.router)
app.include_router(club_controller.public_router)
from controllers import player_controller
app.include_router(player_controller.router)
app.include_router(player_controller.public_router)
from controllers import news_controller
app.include_router(news_controller.router)
from controllers import gameweek_controller
app.include_router(gameweek_controller.router)
app.include_router(gameweek_controller.public_router)
from controllers import match_controller
app.include_router(match_controller.router)
app.include_router(match_controller.public_router)
from controllers import match_lineup_controller
app.include_router(match_lineup_controller.router)
app.include_router(match_lineup_controller.public_router)
from controllers import match_substitution_controller
app.include_router(match_substitution_controller.router)
app.include_router(match_substitution_controller.public_router)
from controllers import match_statistics_controller
app.include_router(match_statistics_controller.router)
app.include_router(match_statistics_controller.public_router)
from controllers import matchevent_controller
app.include_router(matchevent_controller.router)
app.include_router(matchevent_controller.public_router)
from controllers import fantasy_points_controller
app.include_router(fantasy_points_controller.router)
from controllers import league_table_controller
app.include_router(league_table_controller.router)
from controllers import top_scorers_controller
app.include_router(top_scorers_controller.router)
from controllers import fantasy_team_controller
app.include_router(fantasy_team_controller.router)
app.include_router(fantasy_team_controller.public_router)
from controllers import transfer_window_controller
app.include_router(transfer_window_controller.router)
from controllers import fantasy_transfer_controller
app.include_router(fantasy_transfer_controller.router)
from controllers import poll_controller
app.include_router(poll_controller.router)
app.include_router(poll_controller.public_router)
from controllers import match_prediction_controller
app.include_router(match_prediction_controller.router)
