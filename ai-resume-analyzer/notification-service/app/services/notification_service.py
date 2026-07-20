from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from uuid import UUID
from typing import List

class NotificationService:
    def get_notifications(self, db: Session, user_id: UUID) -> List[Notification]:
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    def get_unread_count(self, db: Session, user_id: UUID) -> int:
        return db.query(Notification).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).count()

    def mark_as_read(self, db: Session, notification_id: UUID, user_id: UUID) -> bool:
        db_notif = db.query(Notification).filter(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        ).first()
        if not db_notif:
            return False
        db_notif.is_read = True
        db.commit()
        return True

    def mark_all_as_read(self, db: Session, user_id: UUID) -> int:
        unread = db.query(Notification).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).all()
        for notif in unread:
            notif.is_read = True
        db.commit()
        return len(unread)

    def delete_notification(self, db: Session, notification_id: UUID, user_id: UUID) -> bool:
        db_notif = db.query(Notification).filter(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        ).first()
        if not db_notif:
            return False
        db.delete(db_notif)
        db.commit()
        return True

    def create_notification(self, db: Session, create_dto: NotificationCreate) -> Notification:
        db_notif = Notification(**create_dto.model_dump())
        db.add(db_notif)
        db.commit()
        db.refresh(db_notif)
        return db_notif

notification_service = NotificationService()
