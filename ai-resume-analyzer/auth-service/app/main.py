from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, admin
from app.core.database import Base, engine

# Create DB Tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Auth Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/auth", tags=["users"])
app.include_router(admin.router, prefix="/api/auth/admin", tags=["admin"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "auth"}
