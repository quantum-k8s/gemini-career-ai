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
    return await proxy_request(AUTH_SERVICE_URL, f"api/auth/{path}", request)

@gateway_router.api_route("/api/admin/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_admin(path: str, request: Request):
    return await proxy_request(AUTH_SERVICE_URL, f"api/auth/admin/{path}", request)

@gateway_router.api_route("/api/user/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_user(path: str, request: Request):
    return await proxy_request(USER_SERVICE_URL, f"api/user/{path}", request)

@gateway_router.api_route("/api/resumes/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_resumes(path: str, request: Request):
    return await proxy_request(RESUME_SERVICE_URL, f"api/resumes/{path}", request)

@gateway_router.api_route("/api/resumes", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_resumes_root(request: Request):
    return await proxy_request(RESUME_SERVICE_URL, "api/resumes", request)

@gateway_router.api_route("/api/job-descriptions/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_jds(path: str, request: Request):
    return await proxy_request(RESUME_SERVICE_URL, f"api/job-descriptions/{path}", request)

@gateway_router.api_route("/api/job-descriptions", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_jds_root(request: Request):
    return await proxy_request(RESUME_SERVICE_URL, "api/job-descriptions", request)

@gateway_router.api_route("/api/jobs/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_jobs(path: str, request: Request):
    return await proxy_request(JOB_SERVICE_URL, f"api/jobs/{path}", request)

@gateway_router.api_route("/api/ai/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_ai(path: str, request: Request):
    return await proxy_request(AI_SERVICE_URL, f"ai/{path}", request)

@gateway_router.api_route("/api/notifications/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_notifications(path: str, request: Request):
    return await proxy_request(NOTIFICATION_SERVICE_URL, f"api/notifications/{path}", request)

