from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.jobs import router as jobs_router
from app.api.saved import router as saved_router
from app.core.database import Base, engine

# Ensure tables are built
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Job Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router, prefix="/api/jobs")
app.include_router(saved_router, prefix="/api/jobs")

@app.get("/health")
def health():
    return {"status": "ok", "service": "job-service"}
