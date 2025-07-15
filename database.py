from typing import Generator
from sqlmodel import SQLModel, create_engine, Session

# Import svih modela
from models.user_model import User
from models.club_model import Club
from models.player_model import Player
from models.news_model import News
from models.gameweek_model import Gameweek
from models.match_model import Match
from models.matchevent_model import MatchEvent
from models.match_lineup_model import MatchLineup
from models.match_substitution_model import MatchSubstitution
from models.match_statistics_model import MatchStatistics
from models.fantasyteam_model import FantasyTeam
from models.fantasyteamplayer import FantasyTeamPlayer
from models.gameweekscore_model import GameweekScore
from models.playerfantasypoints_model import PlayerFantasyPoints
from models.transfer_window_model import TransferWindow
from models.transfer_log_model import TransferLog
from models.gameweek_team_model import GameweekTeam
from models.gameweek_player_model import GameweekPlayer

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
