from app.api.schemas import Alert, Feedback

def format_resolution(alert: Alert, fb: Feedback) -> str:
    """Format incident resolution into structured text for Hindsight."""
    return f"""INCIDENT {alert.id} | service: {alert.service} | severity: {alert.severity}
Symptoms: {alert.summary}
Root cause: {fb.actual_root_cause or 'Unknown'}
Fix applied: Rank {fb.fix_rank_used} (outcome: {fb.outcome}) - Notes: {fb.notes or 'None'}
Outcome: {fb.outcome} | time to resolve: {fb.minutes_to_resolve or 'Unknown'} min
"""
