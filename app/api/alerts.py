from fastapi import APIRouter
from app.api.schemas import Alert, AgentResponse
from app.api.feedback import ALERT_CACHE
from app.db.metrics import get_db_connection
from app.agent.orchestrator import handle_alert as orchestrate_alert

router = APIRouter()

@router.post("/alert", response_model=AgentResponse)
def handle_alert(alert: Alert, memory_enabled: bool = True):
    ALERT_CACHE[alert.id] = alert
    
    with get_db_connection() as conn:
        conn.execute('''
            INSERT OR IGNORE INTO incident_metrics (alert_id, memory_enabled)
            VALUES (?, ?)
        ''', (alert.id, memory_enabled))
        conn.commit()

    return orchestrate_alert(alert, memory_enabled)
