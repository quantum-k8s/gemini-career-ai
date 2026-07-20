from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    responsibilities: Optional[List[str]] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = "USD"
    job_type: Optional[str] = "Full-time"
    experience_level: Optional[str] = "Entry"
    skills_required: Optional[List[str]] = None
    is_remote: Optional[bool] = False
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = True

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    responsibilities: Optional[List[str]] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    skills_required: Optional[List[str]] = None
    is_remote: Optional[bool] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

class JobResponse(JobBase):
    id: UUID
    posted_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SavedJobResponse(BaseModel):
    id: UUID
    user_id: UUID
    job_id: UUID
    created_at: datetime
    job: Optional[JobResponse] = None

    model_config = ConfigDict(from_attributes=True)

class AppliedJobCreate(BaseModel):
    resume_id: Optional[UUID] = None
    cover_letter: Optional[str] = None

class AppliedJobResponse(BaseModel):
    id: UUID
    user_id: UUID
    job_id: UUID
    resume_id: Optional[UUID] = None
    status: str
    cover_letter: Optional[str] = None
    applied_at: datetime
    updated_at: datetime
    job: Optional[JobResponse] = None

    model_config = ConfigDict(from_attributes=True)
