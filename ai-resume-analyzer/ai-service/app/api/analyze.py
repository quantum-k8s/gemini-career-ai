import json
import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import ScoreRequest, RefactorRequest, SkillGapRequest, InterviewQuestionsRequest
from app.services.prompt_service import prompt_service
from app.core.gemini_client import get_gemini_client

router = APIRouter(prefix="/ai", tags=["AI Operations"])
logger = logging.getLogger(__name__)

def call_gemini(prompt: str) -> dict:
    try:
        genai = get_gemini_client()
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown code blocks from response
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```json") or lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        try:
            return json.loads(text)
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to parse JSON from Gemini. Raw response:\n{response.text}")
            raise HTTPException(
                status_code=500, 
                detail=f"Gemini did not return valid JSON: {str(jde)}. Response: {response.text[:200]}"
            )
    except Exception as e:
        logger.error(f"Gemini API call failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gemini service error: {str(e)}")

@router.post("/ats-score")
async def ats_score(req: ScoreRequest):
    try:
        template = prompt_service.get_prompt("ats_scoring.txt")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load prompt template: {str(e)}")
        
    jd = req.job_description or "No target job description specified."
    prompt = f"{template}\n\nResume Text:\n{req.resume_text}\n\nJob Description:\n{jd}"
    return call_gemini(prompt)

@router.post("/refactor")
async def refactor(req: RefactorRequest):
    try:
        template = prompt_service.get_prompt("resume_refactor.txt")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load prompt template: {str(e)}")
        
    prompt = f"{template}\n\nOriginal Resume:\n{req.resume_text}\n\nTarget Job Description:\n{req.job_description}"
    return call_gemini(prompt)

@router.post("/skill-gap")
async def skill_gap(req: SkillGapRequest):
    try:
        template = prompt_service.get_prompt("skill_gap.txt")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load prompt template: {str(e)}")
        
    prompt = f"{template}\n\nResume Text:\n{req.resume_text}\n\nJob Description:\n{req.job_description}"
    return call_gemini(prompt)

@router.post("/interview-questions")
async def interview_questions(req: InterviewQuestionsRequest):
    try:
        template = prompt_service.get_prompt("interview_questions.txt")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load prompt template: {str(e)}")
        
    prompt = f"{template}\n\nResume Text:\n{req.resume_text}\n\nJob Description:\n{req.job_description}"
    return call_gemini(prompt)
