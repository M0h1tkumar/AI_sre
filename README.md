# 🧠 RunbookMind AI SRE Agent

> Autonomous SRE Incident Diagnosis & Remediation Reranking powered by **Hindsight Cloud Memory Engine** and **Groq LLM Inference**.

---

## 🌟 Overview

**RunbookMind** is an intelligent AI Site Reliability Engineering (SRE) platform designed to automatically analyze high-severity incident alerts, search log snippets & deployment histories, generate root cause hypotheses, and rank step-by-step remediation actions.

By leveraging **Hindsight Cloud Memory**, RunbookMind retains human SRE feedback (*Worked*, *Failed*) in a vector bank (`devnote`) to dynamically rerank fix suggestions for future incidents, preventing repetitive downtime.

---

## ✨ Features

- **⚡ Live Groq LLM Inference**: Fast root cause hypothesis generation via Groq `openai/gpt-oss-120b`.
- **🧠 Hindsight Cloud Memory Engine**: Vector-based recall & retention bank (`devnote`) that continuously learns from incident resolution feedback.
- **🎨 Glassmorphic Control Center UI**: Built with React, Vite, and TailwindCSS using a dark teal/emerald glassmorphic theme.
- **📊 Real-time Metrics & Audit Trail**: SQLite incident tracking database (`/metrics`) recording resolution times, memory toggles, and accuracy metrics.
- **🔄 Scenario Simulation**: Built-in incident scenario switcher for `Checkout API`, `Auth Service`, and `Payment Gateway`.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS
- **Backend**: FastAPI (Python 3.13), Uvicorn, Pydantic v2, SQLite
- **LLM Provider**: Groq API (`openai/gpt-oss-120b`)
- **Memory Provider**: Hindsight Cloud Vector Bank (`https://api.hindsight.vectorize.io`)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key

### 2. Environment Setup
Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=devnote
PRIMARY_MODEL=openai/gpt-oss-120b
FALLBACK_MODEL=qwen/qwen3.8-27b
```

### 3. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --port 8000
```

### 4. Frontend Setup
```bash
cd ui
npm install
npm run dev
```

The web UI will be accessible at `http://localhost:5173/` and the backend API docs at `http://localhost:8000/docs`.

---

## 📡 API Reference

- `POST /alert`: Submits an incident alert for Groq LLM diagnosis and Hindsight memory reranking.
- `POST /feedback`: Records human SRE feedback (*Worked* / *Failed*) and updates Hindsight retention.
- `GET /metrics`: Returns incident resolution metrics history.
- `GET /health`: Health check endpoint (`{"status": "ok"}`).

---

## 📜 License
MIT License
