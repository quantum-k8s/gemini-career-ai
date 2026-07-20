import os
import io
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime, select
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.sql import func
from pypdf import PdfReader
import docx2txt
from pydantic import BaseModel
from typing import List, Optional

# SQLAlchemy Models
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@postgres:5432/resumedb")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)
    raw_text = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

Base.metadata.create_all(bind=engine)

# App setup
app = FastAPI(title="AI Resume Parse Service")
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "jwtsecretforauthservice9988")

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Token extraction
def get_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return int(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Session expired")

# Schemas
class JdCreate(BaseModel):
    title: str
    content: str

class JdResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: Optional[object] = None
    class Config:
        orm_mode = True

class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    created_at: Optional[object] = None
    class Config:
        orm_mode = True

@app.post("/api/resumes/upload", response_model=ResumeResponse)
async def upload_resume(
    resume: UploadFile = File(...),
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    filename = resume.filename
    ext = filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    content = await resume.read()
    raw_text = ""

    if ext == "txt":
        raw_text = content.decode("utf-8", errors="ignore")
    elif ext == "pdf":
        pdf_reader = PdfReader(io.BytesIO(content))
        raw_text = "\n".join([page.extract_text() or "" for page in pdf_reader.pages])
    elif ext == "docx":
        raw_text = docx2txt.process(io.BytesIO(content))

    db_resume = Resume(
        user_id=user_id,
        filename=filename,
        file_type=ext,
        raw_text=raw_text
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

@app.get("/api/resumes", response_model=List[ResumeResponse])
def list_resumes(user_id: int = Depends(get_user_id), db: Session = Depends(get_db)):
    return db.query(Resume).filter(Resume.user_id == user_id).all()

@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: int, user_id: int = Depends(get_user_id), db: Session = Depends(get_db)):
    res = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(res)
    db.commit()
    return {"message": "Document deleted"}

@app.post("/api/job-descriptions", response_model=JdResponse)
def create_jd(jd: JdCreate, user_id: int = Depends(get_user_id), db: Session = Depends(get_db)):
    db_jd = JobDescription(
        user_id=user_id,
        title=jd.title,
        content=jd.content
    )
    db.add(db_jd)
    db.commit()
    db.refresh(db_jd)
    return db_jd

@app.get("/api/job-descriptions", response_model=List[JdResponse])
def list_jds(user_id: int = Depends(get_user_id), db: Session = Depends(get_db)):
    return db.query(JobDescription).filter(JobDescription.user_id == user_id).all()
