from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.job import Job
from app.models.saved_job import SavedJob
from app.models.applied_job import AppliedJob
from app.schemas.job import JobCreate, JobUpdate, AppliedJobCreate
from uuid import UUID
from typing import List, Optional

class JobService:
    def get_jobs(
        self,
        db: Session,
        search: Optional[str] = None,
        location: Optional[str] = None,
        remote: Optional[bool] = None,
        job_type: Optional[str] = None,
        experience_level: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> List[Job]:
        query = db.query(Job).filter(Job.is_active == True)
        
        if search:
            query = query.filter(
                or_(
                    Job.title.ilike(f"%{search}%"),
                    Job.company.ilike(f"%{search}%"),
                    Job.description.ilike(f"%{search}%")
                )
            )
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        if remote is not None:
            query = query.filter(Job.is_remote == remote)
        if job_type:
            query = query.filter(Job.job_type == job_type)
        if experience_level:
            query = query.filter(Job.experience_level == experience_level)
            
        offset = (page - 1) * limit
        return query.order_by(Job.posted_at.desc()).offset(offset).limit(limit).all()

    def get_job_by_id(self, db: Session, job_id: UUID) -> Optional[Job]:
        return db.query(Job).filter(Job.id == job_id).first()

    def create_job(self, db: Session, job: JobCreate) -> Job:
        db_job = Job(**job.model_dump())
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job

    def update_job(self, db: Session, job_id: UUID, job_update: JobUpdate) -> Optional[Job]:
        db_job = self.get_job_by_id(db, job_id)
        if not db_job:
            return None
        for key, val in job_update.model_dump(exclude_unset=True).items():
            setattr(db_job, key, val)
        db.commit()
        db.refresh(db_job)
        return db_job

    def delete_job(self, db: Session, job_id: UUID) -> bool:
        db_job = self.get_job_by_id(db, job_id)
        if not db_job:
            return False
        db.delete(db_job)
        db.commit()
        return True

    def save_job(self, db: Session, user_id: UUID, job_id: UUID) -> SavedJob:
        db_saved = SavedJob(user_id=user_id, job_id=job_id)
        db.add(db_saved)
        db.commit()
        db.refresh(db_saved)
        return db_saved

    def unsave_job(self, db: Session, user_id: UUID, job_id: UUID) -> bool:
        db_saved = db.query(SavedJob).filter(
            and_(SavedJob.user_id == user_id, SavedJob.job_id == job_id)
        ).first()
        if not db_saved:
            return False
        db.delete(db_saved)
        db.commit()
        return True

    def get_saved_jobs(self, db: Session, user_id: UUID) -> List[SavedJob]:
        saved_records = db.query(SavedJob).filter(SavedJob.user_id == user_id).all()
        for rec in saved_records:
            rec.job = db.query(Job).filter(Job.id == rec.job_id).first()
        return saved_records

    def apply_job(self, db: Session, user_id: UUID, job_id: UUID, application: AppliedJobCreate) -> AppliedJob:
        db_applied = AppliedJob(
            user_id=user_id,
            job_id=job_id,
            resume_id=application.resume_id,
            cover_letter=application.cover_letter,
            status="pending"
        )
        db.add(db_applied)
        db.commit()
        db.refresh(db_applied)
        return db_applied

    def get_applied_jobs(self, db: Session, user_id: UUID) -> List[AppliedJob]:
        applied_records = db.query(AppliedJob).filter(AppliedJob.user_id == user_id).all()
        for rec in applied_records:
            rec.job = db.query(Job).filter(Job.id == rec.job_id).first()
        return applied_records

job_service = JobService()
