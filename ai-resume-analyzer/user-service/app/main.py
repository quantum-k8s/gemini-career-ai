from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.profile import router as profile_router
from app.core.database import Base, engine

# Ensure tables are built
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume User Profile Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router, prefix="/api/user")

@app.get("/health")
def health():
    return {"status": "ok", "service": "user-service"}
