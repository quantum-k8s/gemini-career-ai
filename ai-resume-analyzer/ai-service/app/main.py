from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging_config import setup_logging
from app.api.analyze import router as analyze_router

# Setup structured logging
setup_logging()

app = FastAPI(title="AI Resume Intelligence Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}
