import os
import json
import httpx
from pydantic import ValidationError
from app.config import config
from app.api.schemas import AgentResponse

class LLMClient:
    def __init__(self):
        self.api_key = config.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        
    def chat(self, system_prompt: str, user_prompt: str, model: str = None) -> AgentResponse:
        model = model or config.PRIMARY_MODEL
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        # Ensure system prompt mentions json to satisfy Groq API requirements
        sys_prompt = system_prompt if "json" in system_prompt.lower() else system_prompt + " Return output in valid JSON."
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        
        if not self.api_key:
            return self._mock_response()
            
        try:
            response = httpx.post(self.base_url, json=payload, headers=headers, timeout=20.0)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return AgentResponse.model_validate_json(content)
        except ValidationError as ve:
            print(f"Validation error: {ve}, attempting repair/fallback...")
            if model == config.PRIMARY_MODEL:
                return self.chat(system_prompt, user_prompt, config.FALLBACK_MODEL)
            return self._mock_response()
        except Exception as e:
            print(f"LLM Error: {e}")
            if model == config.PRIMARY_MODEL:
                return self.chat(system_prompt, user_prompt, config.FALLBACK_MODEL)
            return self._mock_response()
            
    def _mock_response(self) -> AgentResponse:
        return AgentResponse(
            alert_id="mock",
            recalled=[],
            hypotheses=[{"root_cause": "Mock cause (No Groq API Key)", "confidence": 0.8, "evidence": []}],
            fixes=[{"steps": ["Check API Key"], "rank": 1, "confidence": 0.9, "source_incident_ids": [], "past_success_rate": 0.0}],
            memory_enabled=True
        )

llm_client = LLMClient()
