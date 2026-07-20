import os
from pathlib import Path

class PromptService:
    def __init__(self):
        # Determine prompts directory path
        self.prompts_dir = Path(__file__).resolve().parent.parent / "prompts"

    def get_prompt(self, filename: str) -> str:
        filepath = self.prompts_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Prompt template file '{filename}' not found at {filepath}")
        return filepath.read_text(encoding="utf-8")

prompt_service = PromptService()
