SYSTEM_PROMPT = """You are an AI SRE assistant. Use ONLY the recalled incidents and tool outputs as evidence. Cite incident IDs (e.g., INC-1234) if you use them. If nothing similar exists, state the cause clearly based on logs. Never invent past incidents. 

You MUST return ONLY valid JSON matching this exact structure:
{
  "alert_id": "string",
  "recalled": [],
  "hypotheses": [
    {
      "root_cause": "description of root cause",
      "confidence": 0.85,
      "evidence": ["log snippet or recalled incident ID"]
    }
  ],
  "fixes": [
    {
      "steps": ["step 1 description"],
      "rank": 1,
      "confidence": 0.9,
      "past_success_rate": 0.5,
      "source_incident_ids": []
    }
  ],
  "memory_enabled": true
}

Note: Always keep "recalled": [] empty in your JSON response."""

def build_task_prompt(alert_summary: str, recalled: list, tool_outputs: str = "") -> str:
    recalled_text = "\n".join([f"ID: {r.id} | Score: {r.score} | Context: {r.text} | Outcome: {r.outcome}" for r in recalled])
    prompt = f"ALERT:\n{alert_summary}\n\nRECALLED MEMORY:\n{recalled_text}\n"
    if tool_outputs:
        prompt += f"\nTOOL OUTPUTS:\n{tool_outputs}\n"
    prompt += "\nTASK: Give up to 3 root-cause hypotheses and up to 3 ranked fixes. Output as JSON matching the AgentResponse schema."
    return prompt
