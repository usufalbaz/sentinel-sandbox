# 🛡️ Sentinel Sandbox
### Disposable Assessment Sandbox-as-a-Service | Powered by IBM Bob 2.0
**Official Project for the IBM Bob 2.0 Hackathon | Built by Team Jinx Security AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hackathon](https://img.shields.io/badge/IBM_Bob_2.0-Hackathon_Project-blue)](https://lablab.ai/ai-hackathons/ibm-bob-2-hackathon)
[![Stack](https://img.shields.io/badge/Stack-Next.js_|_FastAPI_|_Docker_|_IBM_Bob-00F2FE)](#tech-stack)

---

## 1. Problem Statement: The Fake Technical Assessment Trap 

A dangerous and repeatable attack vector currently targets software engineers globally:
1. Threat actors pose as tech recruiters on platforms like LinkedIn and GitHub, offering attractive developer roles.
2. After a brief screening, the candidate is invited to a private GitHub repository for a "take-home technical assessment".
3. The instructions explicitly direct the candidate to run `npm install` (or `npm i`).
4. Malicious npm lifecycle hooks (`preinstall`, `postinstall`, or `prepare`) execute automatically upon installation.
5. In stealth, a silent loader script fetches remote obfuscated JavaScript and executes it with user-level privileges, dropping info-stealers that compromise credentials, SSH keys, browser vaults, and crypto wallets.

**The Core Dilemma:** Developers have had no safe way to complete a legitimate-looking take-home assessment without risking the compromise of their primary workstation.

---

## 2. Our Solution: Don't Block the Workflow. Make It Safe.

**Sentinel Sandbox** inverts the traditional static analysis model ("warn and block") into active containment and verification:
- **Disposable Execution Environment:** Sentinel Sandbox automatically spins up a throwaway, containerized sandbox (Docker) for each incoming assessment repository.
- **Safe Execution:** The candidate executes `npm install` and the assessment safely inside the disposable container, isolated from their host workstation, files, and network.
- **IBM Bob 2.0 Agentic Runtime Tracing:** While the project installs and runs, IBM Bob 2.0 operates in active agent mode, tracing lifecycle triggers, file system mutations, spawned child processes, and external network calls in real time.
- **Forensic Plain-Language Explanations:** If malicious activity is detected, IBM Bob breaks down the full execution chain into clear, human-readable insights with actionable verdicts.

---

## 3. High-Level System Architecture

```
[Target GitHub Repository URL]
               |
               v
   [Disposable Sandbox Engine]
   (Ephemeral Containerized Isolation)
               |
       (Runtime Hooks & Telemetry)
               |
               v
[IBM Bob 2.0 Agentic Reasoning Engine]
   ├── Subagent 1: Process & Lifecycle Monitor
   ├── Subagent 2: Network & Socket Call Tracker
   └── Subagent 3: File System & Credential Watcher
               |
               v
   [Deterministic Verdict Engine]
   (MALICIOUS 🚨 / SUSPICIOUS ⚠️ / CLEAN ✅)
               |
               v
 [Interactive Dashboard & Live Report]
 (Next.js Frontend + Auto-Remediation)
```

---

## 4. Key Features

- **Automated Disposable Sandboxing:** Instant container orchestration per scan request, securely destroyed post-analysis.
- **Pre-Execution & Runtime Defense:** Evaluates configuration manifests (`package.json`) before execution and monitors runtime activity during package installation.
- **Agentic Multi-Step Tracing:** Leverages IBM Bob 2.0 subagents to correlate multi-file interactions into a single coherent threat narrative.
- **Interactive Security Q&A:** Allows developers to ask follow-up questions directly to the AI agent regarding specific findings.
- **Automated Secure Patching:** Generates production-ready, remediated code for identified static and dynamic vulnerabilities.

---

## 5. Tech Stack

- **AI Core & Agentic Orchestration:** IBM Bob 2.0 (Agent Mode, Subagents & Repository Understanding)
- **Frontend & UI Dashboard:** Next.js, React, TypeScript, Tailwind CSS (Deployed on Vercel)
- **Backend & API Layer:** FastAPI, Python, Pydantic
- **Containerization & Sandbox:** Docker, Linux Namespace Isolation
- **Version Control & CI:** Git, GitHub Actions

---

## 6. Project Directory Structure

```
sentinel-sandbox/
├── backend/
│   ├── agent/            # Bob 2.0 integration & security rule engine
│   ├── api/              # REST API endpoints & scan routes
│   ├── app/scanner/      # Scanner runner orchestration
│   ├── core/             # Static analyzer, security adapter & in-memory store
│   ├── sandbox/          # Docker runner, monitor & isolation configuration
│   ├── services/         # Scan lifecycle manager
│   ├── tests/            # Automated test suites & vulnerable fixtures
│   ├── main.py           # FastAPI application entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router (layout, page, styles)
│   │   ├── components/   # ScanForm, VerdictPanel, FindingsFeed, FollowUpChat
│   │   └── lib/          # API client & TypeScript interfaces
│   └── package.json
├── ibm-bob-evidence/     # Official Bob 2.0 task session verification screenshots
├── LICENSE
└── README.md
```

---

## 7. Quick Start

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Linux / macOS
# or: .venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Dashboard runs on [http://localhost:3000](http://localhost:3000).  
API backend runs on [http://localhost:8000](http://localhost:8000).

---

## 8. Team Jinx Security AI

- **Yousuf El-Baz (Mr. G):** Team Lead, Architecture Coordination & Presentation Lead
- **Eman Mirza:** Full-Stack Lead, Frontend Architecture & Agent Workflow
- **Junior Antony Maina:** Backend API & Security Engine Integration
- **Ujjwal Pathak:** API Infrastructure & Pipeline Testing
- **Aiman Babar:** Security Pattern Research & Test Suites
- **XenoNOno:** DevOps, Environment Configuration & Repository Management

---

## 9. License

This project is open-source and distributed under the **MIT License**. See the `LICENSE` file for details.
