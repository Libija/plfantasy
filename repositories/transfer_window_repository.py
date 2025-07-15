from sqlmodel import Session, select
from models.transfer_window_model import TransferWindow, TransferWindowStatus
from typing import List, Optional
from datetime import datetime

class TransferWindowRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, transfer_window: TransferWindow) -> TransferWindow:
        self.session.add(transfer_window)
        self.session.commit()
        self.session.refresh(transfer_window)
        return transfer_window

    def get_by_id(self, transfer_window_id: int) -> Optional[TransferWindow]:
        return self.session.get(TransferWindow, transfer_window_id)

    def get_by_season(self, season: str) -> Optional[TransferWindow]:
        """Dohvati globalni transfer window za sezonu"""
        statement = select(TransferWindow).where(
            TransferWindow.season == season
        )
        return self.session.exec(statement).first()

    def get_current_transfer_window(self, season: str) -> Optional[TransferWindow]:
        """Dohvati trenutni otvoreni transfer window"""
        statement = select(TransferWindow).where(
            TransferWindow.season == season,
            TransferWindow.status == TransferWindowStatus.OPEN
        )
        result = list(self.session.exec(statement).all())
        # Sortiraj po created_at desc i uzmi prvi
        if result:
            result.sort(key=lambda x: x.created_at, reverse=True)
            return result[0]
        return None

    def get_all_by_season(self, season: str) -> List[TransferWindow]:
        statement = select(TransferWindow).where(
            TransferWindow.season == season
        )
        result = list(self.session.exec(statement).all())
        # Sortiraj po created_at
        result.sort(key=lambda x: x.created_at)
        return result

    def update_status(self, transfer_window_id: int, status: TransferWindowStatus) -> Optional[TransferWindow]:
        transfer_window = self.get_by_id(transfer_window_id)
        if transfer_window:
            transfer_window.status = status
            transfer_window.updated_at = datetime.utcnow()
            self.session.commit()
            self.session.refresh(transfer_window)
        return transfer_window

    def is_transfer_window_open(self, season: str) -> bool:
        """Provjeri da li je transfer window otvoren za sezonu"""
        transfer_window = self.get_by_season(season)
        if not transfer_window:
            return False
        
        # Jednostavna logika - provjeri samo status
        return transfer_window.status == TransferWindowStatus.OPEN 