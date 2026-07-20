import os
import httpx
from fastapi import APIRouter, Request, Response, HTTPException

gateway_router = APIRouter()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
RESUME_SERVICE_URL = os.getenv("RESUME_SERVICE_URL", "http://resume-service:8002")
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-service:8003")
JOB_SERVICE_URL = os.getenv("JOB_SERVICE_URL", "http://job-service:8004")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8005")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification-service:8006")

async def proxy_request(service_url: str, path: str, request: Request) -> Response:
    client = httpx.AsyncClient()
    method = request.method
    headers = dict(request.headers)
    
    # Strip host header to prevent proxy mismatch
    if "host" in headers:
        del headers["host"]
        
    url = f"{service_url}/{path}"
    content = await request.body()
    
    try:
        response = await client.request(
            method,
            url,
            headers=headers,
            params=request.query_params,
            content=content,
            timeout=60.0
        )
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Service unavailable: {str(exc)}")

@gateway_router.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_auth(path: str, request: Request):
    return await proxy_request(AUTH_SERVICE_URL, f"auth/{path}", request)

@gateway_router.api_route("/api/resume/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_resume(path: str, request: Request):
    return await proxy_request(RESUME_SERVICE_URL, f"resumes/{path}" if path.startswith("resumes") else path, request)

@gateway_router.api_route("/api/ai/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_ai(path: str, request: Request):
    return await proxy_request(AI_SERVICE_URL, f"ai/{path}" if path.startswith("ats-score") or path.startswith("refactor") else path, request)

@gateway_router.api_route("/api/jobs/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_jobs(path: str, request: Request):
    return await proxy_request(JOB_SERVICE_URL, f"jobs/{path}" if path.startswith("jobs") else path, request)

@gateway_router.api_route("/api/user/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_user(path: str, request: Request):
    return await proxy_request(USER_SERVICE_URL, f"user/{path}" if path.startswith("profile") else path, request)

@gateway_router.api_route("/api/notifications/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_notifications(path: str, request: Request):
    return await proxy_request(NOTIFICATION_SERVICE_URL, f"notifications/{path}" if path.startswith("notifications") else path, request)
