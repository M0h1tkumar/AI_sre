import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'metrics.db')

@contextmanager
def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS incident_metrics (
                alert_id TEXT PRIMARY KEY,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                memory_enabled BOOLEAN,
                top1_correct BOOLEAN,
                top3_correct BOOLEAN,
                minutes_to_resolve INTEGER
            )
        ''')
        conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized.")
