# Business Requirements Document (BRD)
**Project:** RunbookMind – AI SRE Agent with Persistent Memory (Hindsight)
**Version:** 1.0 | **Status:** Draft | **Context:** Hindsight Hackathon

---

## 1. Purpose
Define the business need, goals, and scope for an AI agent that helps on-call engineers resolve production incidents faster by remembering every past incident, root cause, and fix that worked.

## 2. Background & Problem Statement
When production breaks, engineers ask: *"Have we seen this before, and what fixed it?"* The answer is scattered across logs, chat threads, post-mortems, and the heads of senior engineers.

**Consequences:**
- High Mean Time To Resolution (MTTR); downtime costs revenue and trust
- Repeat incidents with the same root cause
- Knowledge loss when engineers leave or rotate off-call
- Junior on-call engineers escalate unnecessarily, burning senior time

## 3. Business Objectives
| # | Objective | Measure |
|---|-----------|---------|
| O1 | Reduce MTTR for recurring incident types | 30–50% faster (demo benchmark) |
| O2 | Capture tribal knowledge automatically | 100% of resolved incidents stored |
| O3 | Reduce unnecessary escalations | Fewer senior pages for known issues |
| O4 | Improve fix recommendations over time | Top-1 suggestion accuracy rises across incidents |

## 4. Scope
**In scope**
- Alert intake and incident triage
- Recall of similar past incidents and their resolutions
- Ranked fix recommendations with supporting evidence
- Outcome feedback loop (worked / didn't work)
- Auto-generated post-incident summary stored to memory

**Out of scope (v1)**
- Autonomous remediation (agent suggests, human executes)
- Live integration with real monitoring vendors (synthetic data used)
- Multi-tenant auth and billing

## 5. Stakeholders
| Stakeholder | Interest |
|-------------|----------|
| On-call SRE / DevOps engineer | Faster diagnosis, less stress |
| Engineering manager | Lower MTTR, fewer repeat incidents |
| Junior engineers | Access to senior-level knowledge |
| Hackathon judges | Innovation, memory usage, real-world value |

## 6. Business Requirements
- **BR-1** The system shall recall relevant past incidents for any new alert.
- **BR-2** The system shall recommend fixes ranked by historical success.
- **BR-3** The system shall learn from engineer feedback on each recommendation.
- **BR-4** The system shall persist all incident knowledge across sessions.
- **BR-5** The system shall demonstrate measurable improvement between early and later incidents.
- **BR-6** The system shall present evidence (which past incident, why it matches).

## 7. Success Criteria
- Demo shows Incident 1 (generic) vs Incident 10+ (specific, recalled, correct)
- Recommendation accuracy improves as feedback accumulates
- Judges can see memory recall directly in the UI

## 8. Assumptions & Constraints
- Synthetic but realistic incident data is acceptable
- Hindsight (Cloud or OSS) is the required memory layer
- LLM via Groq (gpt-oss-120b / qwen3-32b); must tolerate function-calling errors
- Hackathon time limit forces a single-persona, single-workflow scope

## 9. Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| LLM function-calling failures | Broken demo | Retry + fallback parser |
| Weak synthetic data looks fake | Low credibility | Realistic logs, names, numbers |
| Memory recall returns noise | Bad suggestions | Structured retain format, tags |
| Scope creep | Unfinished demo | Lock to one workflow |

## 10. Business Case
An "AI SRE" category is emerging; teams pay to cut downtime and on-call burden. Value = (incidents/month × minutes saved × cost per minute of downtime) + reduced senior-engineer interrupts.
