from app.api.schemas import FixSuggestion, RecalledMemory
from typing import List

def score_fix(fix: FixSuggestion, recalled: List[RecalledMemory]) -> float:
    history = [m for m in recalled if any(inc_id in m.id for inc_id in fix.source_incident_ids)]
    successes = sum(1 for m in history if m.outcome == "worked")
    partials = sum(1 for m in history if m.outcome == "partial")
    total = len(history) or 1
    success_rate = (successes + 0.5 * partials) / total
    
    recency_boost = 1.1 if any(getattr(m, 'age_days', 100) < 30 for m in history) else 1.0
    return (0.6 * fix.confidence + 0.4 * success_rate) * recency_boost

def rerank(fixes: List[FixSuggestion], recalled: List[RecalledMemory]) -> List[FixSuggestion]:
    for fix in fixes:
        fix.past_success_rate = score_fix(fix, recalled)
    fixes.sort(key=lambda x: x.past_success_rate, reverse=True)
    
    for i, fix in enumerate(fixes):
        fix.rank = i + 1
    return fixes
