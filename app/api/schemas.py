from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

class Alert(BaseModel):
    id: str
    service: str
    severity: str
    summary: str
    raw_log_snippet: Optional[str] = None
    timestamp: datetime

class Hypothesis(BaseModel):
    root_cause: str
    confidence: float
    evidence: List[str]

class FixSuggestion(BaseModel):
    steps: List[str]
    rank: int
    confidence: float
    past_success_rate: Optional[float] = None
    source_incident_ids: List[str]

class RecalledMemory(BaseModel):
    id: str
    text: str
    score: float
    outcome: Optional[str] = None
    age_days: Optional[int] = None

class AgentResponse(BaseModel):
    alert_id: str
    recalled: List[RecalledMemory]
    hypotheses: List[Hypothesis]
    fixes: List[FixSuggestion]
    memory_enabled: bool

class Feedback(BaseModel):
    alert_id: str
    fix_rank_used: int
    outcome: Literal["worked", "partial", "failed"]
    actual_root_cause: Optional[str] = None
    minutes_to_resolve: Optional[int] = None
    notes: Optional[str] = None
