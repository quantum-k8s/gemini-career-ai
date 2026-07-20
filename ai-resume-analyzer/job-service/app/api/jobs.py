from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.job import JobCreate, JobUpdate, JobResponse, AppliedJobCreate, AppliedJobResponse
from app.services.job_service import job_service
from uuid import UUID
from typing import List, Optional
from jose import jwt, JWTError
import os

router = APIRouter(tags=["Jobs"])
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

@router.get("/jobs", response_model=List[JobResponse])
def get_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    remote: Optional[bool] = None,
    job_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return job_service.get_jobs(db, search, location, remote, job_type, experience_level, page, limit)

@router.get("/jobs/{id}", response_model=JobResponse)
def get_job(id: UUID, db: Session = Depends(get_db)):
    job = job_service.get_job_by_id(db, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")
    return job

@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job: JobCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    # In a real environment, we would check if the user is an admin.
    return job_service.create_job(db, job)

@router.put("/jobs/{id}", response_model=JobResponse)
def update_job(id: UUID, job_update: JobUpdate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    job = job_service.update_job(db, id, job_update)
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")
    return job

@router.delete("/jobs/{id}", status_code=status.HTTP_200_OK)
def delete_job(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = job_service.delete_job(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Job listing not found")
    return {"message": "Job deleted successfully"}

@router.post("/jobs/{id}/apply", response_model=AppliedJobResponse)
def apply_to_job(
    id: UUID,
    application: AppliedJobCreate,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    # Check if job exists
    job = job_service.get_job_by_id(db, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        return job_service.apply_job(db, user_id, id, application)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Application failed: {str(e)}")

@router.get("/applied-jobs", response_model=List[AppliedJobResponse])
def get_applied_jobs(db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return job_service.get_applied_jobs(db, user_id)
