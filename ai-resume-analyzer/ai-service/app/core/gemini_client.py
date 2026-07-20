import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_gemini_client():
    if not settings.GOOGLE_AI_API_KEY:
        logger.warning("GOOGLE_AI_API_KEY is not set. Gemini API calls will fail.")
    genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
    return genai
