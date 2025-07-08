from contextlib import asynccontextmanager
from typing import Annotated
from database import engine
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select
from starlette.middleware.cors import CORSMiddleware




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
        allow_methods=["*"],
        allow_headers=["*"]
    )

    return app



app = start_application()

from controllers import user_controller
app.include_router(user_controller.router)
from controllers import club_controller
app.include_router(club_controller.router)
