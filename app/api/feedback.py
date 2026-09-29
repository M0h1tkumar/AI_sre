from fastapi import APIRouter
from app.api.schemas import Feedback
from app.db.metrics import get_db_connection
from app.memory.client import memory_client
from app.api.schemas import Alert
from datetime import datetime

router = APIRouter()

# Mock alert cache to recreate alert context for retain
ALERT_CACHE = {}

@router.post("/feedback")
def submit_feedback(feedback: Feedback):
    with get_db_connection() as conn:
        conn.execute('''
            UPDATE incident_metrics 
            SET top1_correct = ?, top3_correct = ?, minutes_to_resolve = ?
            WHERE alert_id = ?
        ''', (
            feedback.fix_rank_used == 1 and feedback.outcome == "worked",
            feedback.fix_rank_used <= 3 and feedback.outcome in ["worked", "partial"],
            feedback.minutes_to_resolve,
            feedback.alert_id
        ))
        conn.commit()

    alert = ALERT_CACHE.get(feedback.alert_id)
    if alert:
        memory_client.retain_resolution(alert, feedback)
    else:
        alert = Alert(id=feedback.alert_id, service="unknown", severity="unknown", summary="unknown", timestamp=datetime.now())
        memory_client.retain_resolution(alert, feedback)

    return {"status": "success", "memory_updated": True}
