from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.profile import (
    ProfileResponse, ProfileUpdate, ProfileCompletionResponse,
    ExperienceCreate, ExperienceResponse, EducationCreate, EducationResponse,
    ProjectCreate, ProjectResponse, SkillCreate, SkillResponse,
    CertificationCreate, CertificationResponse
)
from app.services.profile_service import profile_service
from uuid import UUID
from typing import List, Optional
from jose import jwt, JWTError
import os

router = APIRouter(tags=["Profile"])
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

@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return profile_service.get_profile(db, user_id)

@router.put("/profile", response_model=ProfileResponse)
def update_profile(update: ProfileUpdate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return profile_service.update_profile(db, user_id, update)

# Experience
@router.post("/profile/experiences", response_model=ExperienceResponse)
def add_experience(exp: ExperienceCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return profile_service.add_experience(db, user_id, exp)

@router.put("/profile/experiences/{id}", response_model=ExperienceResponse)
def update_experience(id: UUID, exp: ExperienceCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    updated = profile_service.update_experience(db, id, user_id, exp)
    if not updated:
        raise HTTPException(status_code=404, detail="Experience record not found")
    return updated

@router.delete("/profile/experiences/{id}")
def delete_experience(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = profile_service.delete_experience(db, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Experience record not found")
    return {"message": "Experience record deleted"}

# Education
@router.post("/profile/educations", response_model=EducationResponse)
def add_education(edu: EducationCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return profile_service.add_education(db, user_id, edu)

@router.put("/profile/educations/{id}", response_model=EducationResponse)
def update_education(id: UUID, edu: EducationCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    updated = profile_service.update_education(db, id, user_id, edu)
    if not updated:
        raise HTTPException(status_code=404, detail="Education record not found")
    return updated

@router.delete("/profile/educations/{id}")
def delete_education(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = profile_service.delete_education(db, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Education record not found")
    return {"message": "Education record deleted"}

# Project
@router.post("/profile/projects", response_model=ProjectResponse)
def add_project(proj: ProjectCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return profile_service.add_project(db, user_id, proj)

@router.put("/profile/projects/{id}", response_model=ProjectResponse)
def update_project(id: UUID, proj: ProjectCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    updated = profile_service.update_project(db, id, user_id, proj)
    if not updated:
        raise HTTPException(status_code=404, detail="Project record not found")
    return updated

@router.delete("/profile/projects/{id}")
def delete_project(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = profile_service.delete_project(db, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project record not found")
    return {"message": "Project record deleted"}

# Skill
@router.post("/profile/skills", response_model=SkillResponse)
def add_skill(skill: SkillCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return profile_service.add_skill(db, user_id, skill)

@router.delete("/profile/skills/{id}")
def delete_skill(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = profile_service.delete_skill(db, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill record not found")
    return {"message": "Skill record deleted"}

# Certification
@router.post("/profile/certifications", response_model=CertificationResponse)
def add_certification(cert: CertificationCreate, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return profile_service.add_certification(db, user_id, cert)

@router.delete("/profile/certifications/{id}")
def delete_certification(id: UUID, db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    success = profile_service.delete_certification(db, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Certification record not found")
    return {"message": "Certification record deleted"}

# Completion percentage
@router.get("/profile/completion", response_model=ProfileCompletionResponse)
def get_completion(db: Session = Depends(get_db), user_id: UUID = Depends(get_current_user_id)):
    return profile_service.get_completion(db, user_id)
