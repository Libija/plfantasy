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

# PostgreSQL connection string sa Aiven-a
postgres_url = "postgresql://avnadmin:AVNS_DWsOBrpf63F7vWUzPaa@plkutak-ahmeddadada-6942.i.aivencloud.com:18528/defaultdb?sslmode=require"
engine = create_engine(postgres_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
