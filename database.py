from typing import Generator
from sqlmodel import SQLModel, create_engine, Session
import time

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
from models.poll_model import Poll, PollOption, PollVote
from models.gameweek_team_model import GameweekTeam
from models.gameweek_player_model import GameweekPlayer
from models.match_prediction_model import MatchPrediction

# PostgreSQL connection string sa Aiven-a
postgres_url = "postgresql://avnadmin:AVNS_DWsOBrpf63F7vWUzPaa@plkutak-ahmeddadada-6942.i.aivencloud.com:18528/defaultdb?sslmode=require"

# Osnovna konfiguracija - optimizovano za Aiven Free tier
engine = create_engine(
    postgres_url, 
    echo=False,  # Isključeno echo za manje I/O
    pool_size=2,  # Minimalan pool za free tier
    max_overflow=3,  # Maksimalno 5 konekcija ukupno
    pool_pre_ping=True,
    pool_recycle=180,  # 3 minuta - kraći recycle
    pool_timeout=10,  # Timeout za konekciju
    connect_args={
        "connect_timeout": 10,
        "application_name": "plfantasy"
    }
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
