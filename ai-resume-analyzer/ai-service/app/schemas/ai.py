from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class ScoreRequest(BaseModel):
    resume_text: str = Field(..., description="The plain text content of the resume")
    job_description: Optional[str] = Field(None, description="The job description to compare against")

class RefactorRequest(BaseModel):
    resume_text: str
    job_description: str

class SkillGapRequest(BaseModel):
    resume_text: str
    job_description: str

class InterviewQuestionsRequest(BaseModel):
    resume_text: str
    job_description: str
