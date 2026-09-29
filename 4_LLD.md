# Low-Level Design (LLD)
**System:** RunbookMind – AI SRE Agent
**Version:** 1.0

> Note: verify exact Hindsight client method names and parameters against https://hindsight.vectorize.io/ before coding. The calls below use the core operations (retain, recall, reflect) at a conceptual level.

---

## 1. Repository Structure
```
runbookmind/
├── app/
│   ├── main.py                # FastAPI entrypoint
│   ├── config.py              # env vars, model names
│   ├── api/
│   │   ├── alerts.py          # POST /alert
│   │   ├── feedback.py        # POST /feedback
│   │   └── metrics.py         # GET /metrics
│   ├── agent/
│   │   ├── orchestrator.py    # main reasoning loop
│   │   ├── prompts.py         # system + task prompts
│   │   ├── llm.py             # Groq client, retry, repair
│   │   └── ranking.py         # outcome-weighted ranking
│   ├── memory/
│   │   ├── client.py          # Hindsight wrapper
│   │   └── schema.py          # incident/resolution formatters
│   ├── tools/
│   │   ├── search_logs.py
│   │   ├── deploy_history.py
│   │   └── runbooks.py
│   └── db/
│       └── metrics.py         # SQLite: accuracy per incident
├── data/
│   ├── generate_synthetic.py  # LLM-assisted dataset builder
│   ├── incidents.json
│   ├── logs/
│   └── runbooks/
├── ui/                        # React + Vite frontend (see 5_UI_Design_Spec.md)
│   ├── src/components/        # NowPanel, BeforePanel, RecallTrace, AccuracyCurve
│   ├── src/api.ts             # typed client for /alert, /feedback, /metrics
│   └── tailwind.config.ts     # design tokens
├── tests/
├── docker-compose.yml
└── README.md
```

## 2. Data Models
```python
class Alert(BaseModel):
    id: str
    service: str            # "checkout-api"
    severity: str           # SEV1..SEV4
    summary: str            # "p99 latency 4.2s, 500s rising"
    raw_log_snippet: str | None
    timestamp: datetime

class Hypothesis(BaseModel):
    root_cause: str
    confidence: float       # 0..1
    evidence: list[str]     # cited past incident IDs / log lines

class FixSuggestion(BaseModel):
    steps: list[str]
    rank: int
    confidence: float
    past_success_rate: float | None
    source_incident_ids: list[str]

class AgentResponse(BaseModel):
    alert_id: str
    recalled: list[RecalledMemory]
    hypotheses: list[Hypothesis]
    fixes: list[FixSuggestion]
    memory_enabled: bool

class Feedback(BaseModel):
    alert_id: str
    fix_rank_used: int
    outcome: Literal["worked", "partial", "failed"]
    actual_root_cause: str | None
    minutes_to_resolve: int | None
    notes: str | None
```

## 3. API Specification
| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/alert` | `Alert` + `memory_enabled: bool` | `AgentResponse` |
| POST | `/feedback` | `Feedback` | `{status, memory_updated}` |
| GET | `/incidents` | none | list of past incidents |
| GET | `/metrics` | none | accuracy series for chart |
| POST | `/reflect` | none | cross-incident insights |

## 4. Memory Layer (`memory/client.py`)
```python
class IncidentMemory:
    def __init__(self, bank_id: str): ...

    def recall_similar(self, alert: Alert, k: int = 5) -> list[RecalledMemory]:
        query = f"{alert.service} {alert.summary} {alert.raw_log_snippet or ''}"
        return hindsight.recall(bank_id=self.bank_id, query=query)

    def retain_resolution(self, alert: Alert, fb: Feedback) -> None:
        hindsight.retain(bank_id=self.bank_id, content=format_resolution(alert, fb))

    def reflect(self) -> str:
        return hindsight.reflect(bank_id=self.bank_id,
            query="What recurring patterns and best fixes have emerged?")
```

**Retain format (structured text for better recall):**
```
INCIDENT INC-2041 | service: checkout-api | severity: SEV1
Symptoms: p99 latency 4.2s, Redis evicted_keys spiking, 500 errors
Root cause: Redis maxmemory too low after traffic growth
Fix applied: raised maxmemory 2GB->4GB, set allkeys-lru
Outcome: worked | time to resolve: 14 min
Rejected fixes: restart cache (failed), scale API pods (no effect)
```

## 5. Orchestrator Loop (`agent/orchestrator.py`)
```python
def handle_alert(alert, memory_enabled=True):
    recalled = memory.recall_similar(alert) if memory_enabled else []
    context = build_context(alert, recalled)

    for step in range(MAX_STEPS):           # MAX_STEPS = 4
        result = llm.chat(context, tools=TOOL_SCHEMAS)
        if result.tool_calls:
            outputs = run_tools_safely(result.tool_calls)
            context.append(outputs)
        else:
            break

    parsed = parse_or_repair(result.content, AgentResponse)
    parsed.fixes = ranking.rerank(parsed.fixes, recalled)
    return parsed
```

## 6. Tool Schemas (function calling)
```json
[
  {"name": "search_logs",
   "description": "Search recent logs for a service",
   "parameters": {"service": "string", "query": "string", "minutes": "integer"}},
  {"name": "get_deploy_history",
   "description": "List recent deployments for a service",
   "parameters": {"service": "string", "hours": "integer"}},
  {"name": "get_runbook",
   "description": "Fetch runbook by error type",
   "parameters": {"error_type": "string"}}
]
```

## 7. LLM Error Handling (`agent/llm.py`)
1. Call primary model (gpt-oss-120b)
2. On malformed tool call or invalid JSON: send a repair prompt with the error message (1 attempt)
3. Still failing: retry on fallback model (qwen3-32b)
4. Still failing: return degraded response (recalled incidents only) with a UI warning
5. Timeout: 20 seconds per call, exponential backoff, max 3 retries

## 8. Outcome-Weighted Ranking (`agent/ranking.py`)
```python
def score(fix, recalled):
    history = [m for m in recalled if fix.matches(m)]
    successes = sum(1 for m in history if m.outcome == "worked")
    partials = sum(1 for m in history if m.outcome == "partial")
    total = len(history) or 1
    success_rate = (successes + 0.5 * partials) / total
    recency_boost = 1.1 if any(m.age_days < 30 for m in history) else 1.0
    return (0.6 * fix.confidence + 0.4 * success_rate) * recency_boost
```

## 9. Prompt Skeleton (`agent/prompts.py`)
```
SYSTEM: You are an SRE assistant. Use ONLY the recalled incidents and tool
outputs as evidence. Cite incident IDs. If nothing similar exists, say so.
Never invent past incidents. Return JSON matching the AgentResponse schema.

USER: ALERT: {alert}
RECALLED MEMORY: {recalled}
TASK: Give up to 3 root-cause hypotheses and up to 3 ranked fixes.
```

## 10. Metrics (`db/metrics.py`)
Table `incident_metrics`:
`alert_id, timestamp, memory_enabled, top1_correct (bool), top3_correct (bool), minutes_to_resolve`
The learning curve = rolling accuracy over incident order.

## 11. Synthetic Data Plan
- 8–10 incident families (Redis eviction, DB connection pool exhaustion, bad deploy, disk full, DNS failure, certificate expiry, memory leak, rate limit misconfig)
- Each family: 2–4 variants with different wording and logs
- Realistic fields: service names, error codes, timestamps, stack traces, version numbers
- Seed 15–20 historical incidents into Hindsight before the demo
- Hold out 5 "new" alerts (variants of known families) to demo recall and learning

## 12. Testing
| Type | Cases |
|------|-------|
| Unit | Formatters, ranking, JSON repair |
| Integration | Alert to response with mocked Hindsight and LLM |
| Behavioral | Memory ON beats OFF on held-out alerts |
| Failure | Hindsight down, malformed tool call, empty recall |

## 13. Configuration (`.env`)
```
GROQ_API_KEY=
HINDSIGHT_API_KEY=
HINDSIGHT_BASE_URL=
HINDSIGHT_BANK_ID=runbookmind-demo
PRIMARY_MODEL=openai/gpt-oss-120b
FALLBACK_MODEL=qwen/qwen3-32b
```
