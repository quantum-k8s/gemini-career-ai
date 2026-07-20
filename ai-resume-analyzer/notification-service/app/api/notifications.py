from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.notification import NotificationResponse, NotificationCreate, UnreadCountResponse
from app.services.notification_service import notification_service
from uuid import UUID
from typing import List, Optional
from jose import jwt, JWTError
import os

router = APIRouter(tags=["Notifications"])
JWT_SECRET = os.getenv("JWT_SECRET", "jwtsecretforauthservice9988")

def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
) -> UUID:
    if x_user_id:
        try:
            return UUID(x_user_id)
        except ValueError:
            pass
            
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required")
        
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token claims")
        return UUID(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return notification_service.get_notifications(db, user_id)

@router.get("/notifications/unread-count", response_model=UnreadCountResponse)
def get_unread_count(db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    count = notification_service.get_unread_count(db, user_id)
    return {"count": count}

@router.put("/notifications/{id}/read")
def mark_as_read(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = notification_service.mark_as_read(db, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.put("/notifications/read-all")
def mark_all_as_read(db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    count = notification_service.mark_all_as_read(db, user_id)
    return {"message": f"{count} notifications marked as read"}

@router.delete("/notifications/{id}")
def delete_notification(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = notification_service.delete_notification(db, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted"}

@router.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(notif: NotificationCreate, db: Session = Depends(get_db)):
    # Internal route, usually called via inter-service RPC or gateway. No auth needed.
    return notification_service.create_notification(db, notif)
