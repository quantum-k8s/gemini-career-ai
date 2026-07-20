from sqlalchemy.orm import Session
from app.models.profile import UserProfile
from app.models.experience import Experience
from app.models.education import Education
from app.models.project import Project
from app.models.skill import Skill
from app.models.certification import Certification
from app.schemas.profile import (
    ProfileUpdate, ExperienceCreate, EducationCreate,
    ProjectCreate, SkillCreate, CertificationCreate
)
from uuid import UUID
from typing import List, Optional, Dict, Any

class ProfileService:
    def get_profile(self, db: Session, user_id: UUID) -> UserProfile:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id, headline="", summary="", phone="", location="")
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        # Populate relations manually if required
        profile.experiences = db.query(Experience).filter(Experience.user_id == user_id).all()
        profile.educations = db.query(Education).filter(Education.user_id == user_id).all()
        profile.projects = db.query(Project).filter(Project.user_id == user_id).all()
        profile.skills = db.query(Skill).filter(Skill.user_id == user_id).all()
        profile.certifications = db.query(Certification).filter(Certification.user_id == user_id).all()
        return profile

    def update_profile(self, db: Session, user_id: UUID, update: ProfileUpdate) -> UserProfile:
        profile = self.get_profile(db, user_id)
        for key, val in update.model_dump(exclude_unset=True).items():
            setattr(profile, key, val)
        db.commit()
        db.refresh(profile)
        return self.get_profile(db, user_id)

    # Experience CRUD
    def add_experience(self, db: Session, user_id: UUID, exp: ExperienceCreate) -> Experience:
        db_exp = Experience(user_id=user_id, **exp.model_dump())
        db.add(db_exp)
        db.commit()
        db.refresh(db_exp)
        return db_exp

    def update_experience(self, db: Session, exp_id: UUID, user_id: UUID, exp: ExperienceCreate) -> Optional[Experience]:
        db_exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == user_id).first()
        if not db_exp:
            return None
        for key, val in exp.model_dump().items():
            setattr(db_exp, key, val)
        db.commit()
        db.refresh(db_exp)
        return db_exp

    def delete_experience(self, db: Session, exp_id: UUID, user_id: UUID) -> bool:
        db_exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == user_id).first()
        if not db_exp:
            return False
        db.delete(db_exp)
        db.commit()
        return True

    # Education CRUD
    def add_education(self, db: Session, user_id: UUID, edu: EducationCreate) -> Education:
        db_edu = Education(user_id=user_id, **edu.model_dump())
        db.add(db_edu)
        db.commit()
        db.refresh(db_edu)
        return db_edu

    def update_education(self, db: Session, edu_id: UUID, user_id: UUID, edu: EducationCreate) -> Optional[Education]:
        db_edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == user_id).first()
        if not db_edu:
            return None
        for key, val in edu.model_dump().items():
            setattr(db_edu, key, val)
        db.commit()
        db.refresh(db_edu)
        return db_edu

    def delete_education(self, db: Session, edu_id: UUID, user_id: UUID) -> bool:
        db_edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == user_id).first()
        if not db_edu:
            return False
        db.delete(db_edu)
        db.commit()
        return True

    # Project CRUD
    def add_project(self, db: Session, user_id: UUID, proj: ProjectCreate) -> Project:
        db_proj = Project(user_id=user_id, **proj.model_dump())
        db.add(db_proj)
        db.commit()
        db.refresh(db_proj)
        return db_proj

    def update_project(self, db: Session, proj_id: UUID, user_id: UUID, proj: ProjectCreate) -> Optional[Project]:
        db_proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == user_id).first()
        if not db_proj:
            return None
        for key, val in proj.model_dump().items():
            setattr(db_proj, key, val)
        db.commit()
        db.refresh(db_proj)
        return db_proj

    def delete_project(self, db: Session, proj_id: UUID, user_id: UUID) -> bool:
        db_proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == user_id).first()
        if not db_proj:
            return False
        db.delete(db_proj)
        db.commit()
        return True

    # Skill CRUD
    def add_skill(self, db: Session, user_id: UUID, skill: SkillCreate) -> Skill:
        db_skill = Skill(user_id=user_id, **skill.model_dump())
        db.add(db_skill)
        db.commit()
        db.refresh(db_skill)
        return db_skill

    def delete_skill(self, db: Session, skill_id: UUID, user_id: UUID) -> bool:
        db_skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user_id).first()
        if not db_skill:
            return False
        db.delete(db_skill)
        db.commit()
        return True

    # Certification CRUD
    def add_certification(self, db: Session, user_id: UUID, cert: CertificationCreate) -> Certification:
        db_cert = Certification(user_id=user_id, **cert.model_dump())
        db.add(db_cert)
        db.commit()
        db.refresh(db_cert)
        return db_cert

    def delete_certification(self, db: Session, cert_id: UUID, user_id: UUID) -> bool:
        db_cert = db.query(Certification).filter(Certification.id == cert_id, Certification.user_id == user_id).first()
        if not db_cert:
            return False
        db.delete(db_cert)
        db.commit()
        return True

    # Completion calculation
    def get_completion(self, db: Session, user_id: UUID) -> Dict[str, Any]:
        profile = self.get_profile(db, user_id)
        fields = {
            "headline": profile.headline,
            "summary": profile.summary,
            "phone": profile.phone,
            "location": profile.location,
            "linkedin_url": profile.linkedin_url,
            "github_url": profile.github_url,
        }
        
        filled = 0
        missing = []
        for name, val in fields.items():
            if val and val.strip():
                filled += 1
            else:
                missing.append(name)
                
        # Include lists in assessment
        if profile.experiences:
            filled += 1
        else:
            missing.append("Work Experience (add at least one)")
            
        if profile.educations:
            filled += 1
        else:
            missing.append("Education (add at least one)")
            
        if profile.skills:
            filled += 1
        else:
            missing.append("Skills (add at least one)")
            
        total_checks = len(fields) + 3 # 6 simple fields + 3 checklist items = 9 total
        percentage = int((filled / total_checks) * 100)
        
        return {
            "percentage": percentage,
            "missing_fields": missing
        }

profile_service = ProfileService()
