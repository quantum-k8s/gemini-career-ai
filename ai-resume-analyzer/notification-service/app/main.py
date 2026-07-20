from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.notifications import router as notifications_router
from app.core.database import Base, engine

# Ensure tables are built
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Notifications Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notifications_router, prefix="/api/notifications")

@app.get("/health")
def health():
    return {"status": "ok", "service": "notification-service"}
