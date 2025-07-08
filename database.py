from typing import Generator
from sqlmodel import SQLModel, create_engine, Session

# Naziv fajla i URL za SQLite bazu
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# Potrebno za SQLite da radi sa više threadova (FastAPI koristi async)
connect_args = {"check_same_thread": False}

# Kreiranje engine-a
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

# Funkcija za kreiranje svih tabela (pozoveš je iz main.py jednom)
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Funkcija koja daje novu sesiju za dependency injection u FastAPI-u
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
