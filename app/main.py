from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import alerts, feedback, metrics

app = FastAPI(title="RunbookMind AI SRE Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alerts.router, tags=["Alerts"])
app.include_router(feedback.router, tags=["Feedback"])
app.include_router(metrics.router, tags=["Metrics"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
