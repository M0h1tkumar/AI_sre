# Product Requirements Document (PRD)
**Product:** RunbookMind – AI SRE Agent that learns from every incident
**Version:** 1.0 | **Status:** Draft

---

## 1. Vision
An on-call copilot that remembers every incident your team has ever had, and gets better with each one you resolve.

**One-liner:** *"Your team's incident memory, on call 24/7."*

## 2. Target Users (Personas)
**Priya, On-call SRE (primary)** – Paged at 3 a.m., needs a likely cause and fix in under a minute.
**Arjun, Junior DevOps** – New to the stack, doesn't know past incidents. Needs senior-level context.
**Meera, Eng Manager** – Wants MTTR trends and fewer repeat incidents.

## 3. Problems to Solve
1. Past incident knowledge is scattered and hard to search under pressure
2. Same root causes recur
3. Generic AI advice ignores the team's specific stack history

## 4. User Stories
| ID | As a... | I want to... | So that... |
|----|---------|--------------|-----------|
| US-1 | On-call engineer | paste or receive an alert and get a diagnosis | I start with a hypothesis |
| US-2 | On-call engineer | see similar past incidents with match reasoning | I trust the suggestion |
| US-3 | On-call engineer | get ranked fixes with past success rates | I try the best fix first |
| US-4 | On-call engineer | mark a fix as worked / failed | the agent learns |
| US-5 | On-call engineer | have a post-incident summary auto-generated | documentation is effortless |
| US-6 | Manager | see how recommendation quality improves | I can justify adoption |

## 5. Functional Requirements
**P0 (must have)**
- FR-1 Alert intake (text box + webhook endpoint)
- FR-2 Recall similar incidents from Hindsight memory
- FR-3 Generate root-cause hypotheses with cited past incidents
- FR-4 Ranked fix recommendations with confidence
- FR-5 Feedback capture (worked / partially / failed + notes)
- FR-6 Retain resolved incident into memory in structured form
- FR-7 Visible "Memory Recalled" panel in the UI

**P1 (should have)**
- FR-8 Memory-off vs Memory-on comparison toggle (demo killer feature)
- FR-9 Learning curve chart (top-1 accuracy per incident)
- FR-10 Reflect: pattern insights ("Redis issues cluster after deploys")
- FR-11 Auto post-mortem draft

**P2 (nice to have)**
- FR-12 Slack-style chat interface
- FR-13 Deployment-history correlation
- FR-14 Runbook link suggestions

## 6. Non-Functional Requirements
- Response time under 10 seconds for a recommendation
- Graceful handling of LLM tool-call errors (retry, repair, fallback)
- Deterministic demo mode using seeded synthetic data
- Clean, documented, tested code

## 7. UX Flow
1. Engineer submits alert
2. Agent shows: **Recalled incidents → Hypotheses → Ranked fixes**
3. Engineer tries a fix and gives feedback
4. Agent stores outcome; ranking updates
5. Next similar alert shows improved, more specific suggestion

## 8. Demo Script (60–90 seconds)
1. **Problem** – "3 a.m., checkout is down."
2. **Memory OFF** – generic advice ("check the database, restart services").
3. **Memory ON** – "Matches INC-2041 (Redis eviction, 3 weeks ago). Raising maxmemory fixed it. Confidence 87%."
4. Engineer marks success. Show the learning curve rising over 15 seeded incidents.
5. **Close** – "Interaction 1 generic, interaction 20 knows your stack."

## 9. Success Metrics
- Top-1 fix accuracy: baseline (no memory) vs with memory
- Average recall relevance score
- Time-to-first-hypothesis
- Feedback-driven ranking improvement across N incidents

## 10. Out of Scope (v1)
Autonomous remediation, real vendor integrations, auth, multi-team tenancy.

## 11. Milestones (hackathon timeline)
| Phase | Deliverable |
|-------|-------------|
| 1 | Synthetic dataset + Hindsight bank setup |
| 2 | Core agent: recall, hypothesize, recommend |
| 3 | Feedback loop + retain pipeline |
| 4 | React UI (per UI design spec) + memory on/off toggle + learning chart |
| 5 | Demo video, README, article, social post |

## 12. Open Questions
- Deploy on Hindsight Cloud or self-hosted OSS?
- Resolved: custom React interface (Now/Before layout with recall trace), see 5_UI_Design_Spec.md
