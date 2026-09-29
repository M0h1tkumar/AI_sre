import httpx
from app.config import config
from app.api.schemas import Alert, Feedback, RecalledMemory
from app.memory.schema import format_resolution
import json
import os

class IncidentMemory:
    def __init__(self, bank_id: str = config.HINDSIGHT_BANK_ID):
        self.bank_id = bank_id
        self.base_url = config.HINDSIGHT_BASE_URL
        self.api_key = config.HINDSIGHT_API_KEY

    def _mock_recall(self, query: str) -> list[RecalledMemory]:
        # Fallback to local JSON mock if no real endpoint/key is present
        data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'incidents.json')
        if not os.path.exists(data_path):
            return []
        try:
            with open(data_path, 'r') as f:
                incidents = json.load(f)
            service = query.split()[0] if query else ""
            results = []
            for inc in incidents:
                if service in inc.get('service', '') or inc.get('service', '') in query:
                    results.append(RecalledMemory(
                        id=inc['id'],
                        text=f"{inc['summary']} | Root cause: {inc['root_cause']} | Fix: {inc.get('fix_steps', [])}",
                        score=0.9,
                        outcome=inc.get('outcome', 'worked'),
                        age_days=10
                    ))
            return results[:3]
        except Exception as e:
            return []

    def recall_similar(self, alert: Alert, k: int = 5) -> list[RecalledMemory]:
        query = f"{alert.service} {alert.summary} {alert.raw_log_snippet or ''}"
        
        if not self.api_key:
            return self._mock_recall(query)

        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            response = httpx.post(
                f"{self.base_url}/banks/{self.bank_id}/recall",
                json={"query": query, "k": k},
                headers=headers,
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()
            return [RecalledMemory(**item) for item in data.get('results', [])]
        except Exception as e:
            print(f"Hindsight recall failed: {e}")
            return self._mock_recall(query)

    def retain_resolution(self, alert: Alert, fb: Feedback) -> None:
        content = format_resolution(alert, fb)
        if not self.api_key:
            print(f"Mock retain: {content}")
            return

        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            httpx.post(
                f"{self.base_url}/banks/{self.bank_id}/retain",
                json={"content": content},
                headers=headers,
                timeout=5.0
            )
        except Exception as e:
            print(f"Hindsight retain failed: {e}")

    def reflect(self) -> str:
        return "Cache issues cluster after deploys."

memory_client = IncidentMemory()
