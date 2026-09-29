from fastapi import APIRouter
from app.db.metrics import get_db_connection
from typing import List, Dict

router = APIRouter()

@router.get("/metrics")
def get_metrics():
    with get_db_connection() as conn:
        rows = conn.execute('SELECT * FROM incident_metrics ORDER BY timestamp ASC').fetchall()
    
    result = []
    for r in rows:
        result.append({
            "alert_id": r["alert_id"],
            "timestamp": r["timestamp"],
            "memory_enabled": r["memory_enabled"],
            "top1_correct": r["top1_correct"],
            "top3_correct": r["top3_correct"],
            "minutes_to_resolve": r["minutes_to_resolve"]
        })
    return result
