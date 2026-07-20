from sqlalchemy import Column, String, Integer, Boolean, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255))
    description = Column(String)
    requirements = Column(ARRAY(String))
    responsibilities = Column(ARRAY(String))
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    salary_currency = Column(String(10))
    job_type = Column(String(50))
    experience_level = Column(String(50))
    skills_required = Column(ARRAY(String))
    is_remote = Column(Boolean, default=False)
    posted_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
