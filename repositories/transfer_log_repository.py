from sqlmodel import Session, select
from models.transfer_log_model import TransferLog
from typing import List, Optional

class TransferLogRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, transfer_log: TransferLog) -> TransferLog:
        self.session.add(transfer_log)
        self.session.commit()
        self.session.refresh(transfer_log)
        return transfer_log

    def get_by_id(self, transfer_log_id: int) -> Optional[TransferLog]:
        return self.session.get(TransferLog, transfer_log_id)

    def get_by_fantasy_team(self, fantasy_team_id: int) -> List[TransferLog]:
        statement = select(TransferLog).where(
            TransferLog.fantasy_team_id == fantasy_team_id
        ).order_by(TransferLog.created_at.desc())
        return self.session.exec(statement).all()

    def get_by_fantasy_team_and_gameweek(self, fantasy_team_id: int, gameweek: int) -> List[TransferLog]:
        statement = select(TransferLog).where(
            TransferLog.fantasy_team_id == fantasy_team_id,
            TransferLog.gameweek == gameweek
        ).order_by(TransferLog.created_at)
        return self.session.exec(statement).all()

    def get_transfer_count_by_gameweek(self, fantasy_team_id: int, gameweek: int) -> int:
        """Broj transfera u određenom kolu"""
        statement = select(TransferLog).where(
            TransferLog.fantasy_team_id == fantasy_team_id,
            TransferLog.gameweek == gameweek
        )
        return len(self.session.exec(statement).all())

    def get_total_transfer_cost_by_gameweek(self, fantasy_team_id: int, gameweek: int) -> float:
        """Ukupan trošak transfera u određenom kolu"""
        statement = select(TransferLog).where(
            TransferLog.fantasy_team_id == fantasy_team_id,
            TransferLog.gameweek == gameweek
        )
        transfers = self.session.exec(statement).all()
        return sum(transfer.cost for transfer in transfers) 