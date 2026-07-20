from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.job import SavedJobResponse
from app.services.job_service import job_service
from app.api.jobs import get_current_user_id
from uuid import UUID
from typing import List

router = APIRouter(tags=["Saved Jobs"])

@router.post("/jobs/{id}/save", response_model=SavedJobResponse)
def save_job(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    job = job_service.get_job_by_id(db, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        return job_service.save_job(db, user_id, id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Already bookmarked or error: {str(e)}")

@router.delete("/jobs/{id}/save")
def unsave_job(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = job_service.unsave_job(db, user_id, id)
    if not success:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"message": "Job removed from bookmarks"}

@router.get("/saved-jobs", response_model=List[SavedJobResponse])
def get_saved_jobs(db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return job_service.get_saved_jobs(db, user_id)
