<div align="center">

<!-- Animated logo banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0ea5e9&height=200&section=header&text=Sentinel%20Sandbox&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Disposable%20AI-Powered%20Security%20Scanning&descSize=18&descAlignY=58&animation=fadeIn" width="100%" />

<br/>

<!-- Animated typing headline -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=0EA5E9&center=true&vCenter=true&multiline=true&width=700&height=80&lines=Scan+any+GitHub+repo+before+you+run+it.;IBM+Bob+2.0+AI+Agent+%E2%80%94+Real-time+sandbox+tracing." alt="Typing SVG" />
</a>

<br/><br/>

<!-- Live deployment badges -->
[![Frontend – Live](https://img.shields.io/badge/Frontend-Live%20on%20Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://sentinel-sandbox-kappa.vercel.app/)
[![Backend – Live](https://img.shields.io/badge/Backend-Live%20on%20FastAPI%20Cloud-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://sentinel-sandbox.fastapicloud.dev/)
[![Docs](https://img.shields.io/badge/API%20Docs-Swagger%20UI-orange?style=for-the-badge&logo=swagger&logoColor=white)](https://sentinel-sandbox.fastapicloud.dev/docs)

<br/>

<!-- Tech badges -->
[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![IBM Bob](https://img.shields.io/badge/IBM%20Bob%202.0-AI%20Agent-054ADA?style=flat-square&logo=ibm&logoColor=white)](https://lablab.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 🌐 Live Deployments

| Service | URL | Status |
|---------|-----|--------|
| 🖥️ **Frontend** | [sentinel-sandbox-kappa.vercel.app](https://sentinel-sandbox-kappa.vercel.app/) | ![Vercel](https://img.shields.io/badge/deployed-brightgreen?style=flat-square) |
| ⚙️ **Backend API** | [sentinel-sandbox.fastapicloud.dev](https://sentinel-sandbox.fastapicloud.dev/) | ![API](https://img.shields.io/badge/deployed-brightgreen?style=flat-square) |
| 📖 **Swagger Docs** | [/docs](https://sentinel-sandbox.fastapicloud.dev/docs) | ![Docs](https://img.shields.io/badge/live-blue?style=flat-square) |
| 📘 **ReDoc** | [/redoc](https://sentinel-sandbox.fastapicloud.dev/redoc) | ![Redoc](https://img.shields.io/badge/live-blue?style=flat-square) |

---

## 🎯 Problem Statement — The Fake Technical Assessment Trap

> A dangerous, repeatable attack vector currently targeting software engineers globally.

```
Attacker (fake recruiter on LinkedIn/GitHub)
        │
        ▼
  "Here's your take-home assessment — just run npm install"
        │
        ▼
  Malicious lifecycle hooks fire automatically:
  preinstall / postinstall / prepare
        │
        ▼
  Silent loader fetches obfuscated JS from remote C2
        │
        ▼
  Info-stealer drops → credentials, SSH keys,
  browser vaults, crypto wallets — ALL COMPROMISED
```

**The Core Dilemma:** Developers have had no safe way to complete a legitimate-looking take-home assessment without risking full workstation compromise.

---

## 💡 Our Solution — Don't Block the Workflow. Make It Safe.

**Sentinel Sandbox** inverts the traditional "warn and block" model into **active containment and AI-powered verification**.

| Approach | Traditional Tools | Sentinel Sandbox |
|----------|-------------------|-----------------|
| **Execution** | Static analysis only | Live sandbox execution |
| **Isolation** | None / local | Ephemeral Docker container |
| **AI Reasoning** | No | IBM Bob 2.0 agentic tracing |
| **Verdict** | Heuristic score | Plain-language explanation |
| **Attack chain** | Unknown | Full step-by-step breakdown |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SENTINEL SANDBOX SYSTEM                  │
└─────────────────────────────────────────────────────────────┘

  User (Browser)
       │  submits GitHub URL
       ▼
  ┌────────────────────┐
  │  Next.js Frontend  │  ◄── Vercel (https://sentinel-sandbox-kappa.vercel.app)
  │  React + TypeScript│
  │  Live findings feed│
  │  Verdict panel     │
  └────────┬───────────┘
           │  POST /api/scans
           ▼
  ┌────────────────────┐
  │   FastAPI Backend  │  ◄── FastAPI Cloud (https://sentinel-sandbox.fastapicloud.dev)
  │   REST API Layer   │
  └────────┬───────────┘
           │
     ┌─────┴──────────────────────────────────┐
     │                                        │
     ▼                                        ▼
  ┌──────────────┐                   ┌────────────────────┐
  │ Static       │                   │ Sandbox Engine     │
  │ Analyzer     │                   │ (Docker Runner)    │
  │ package.json │                   │ npm install inside │
  │ script hooks │                   │ isolated container │
  └──────┬───────┘                   └────────┬───────────┘
         │                                    │
         └──────────────┬─────────────────────┘
                        │  telemetry + static findings
                        ▼
           ┌────────────────────────┐
           │  IBM Bob 2.0 Agent     │
           │  Agentic Reasoning     │
           ├────────────────────────┤
           │ • Process Monitor      │
           │ • Network Call Tracker │
           │ • File System Watcher  │
           │ • Credential Scanner   │
           └────────────┬───────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │  Verdict Engine        │
           │  SAFE ✅ / SUSPICIOUS ⚠️ │
           │  DANGEROUS 🚨          │
           └────────────┬───────────┘
                        │  WebSocket / polling
                        ▼
           ┌────────────────────────┐
           │  Live Dashboard        │
           │  Findings Feed         │
           │  Attack Chain Report   │
           │  Follow-up Q&A Chat    │
           └────────────────────────┘
```

---

## 🔄 Complete Scan Workflow

```
Step 1 ──► User pastes GitHub repo URL in the dashboard
             │
Step 2 ──► Frontend POST /api/scans → Backend queues the scan
             │
Step 3 ──► Static Analyzer reads package.json
             │  Checks: lifecycle scripts, suspicious deps,
             │  obfuscated fields, typosquatting patterns
             │
Step 4 ──► Docker sandbox spins up (ephemeral container)
             │  npm install executes inside isolation
             │  Network, filesystem, processes all monitored
             │
Step 5 ──► Telemetry streams to IBM Bob 2.0 Agent
             │  Bob correlates events across subagents:
             │   • Which script triggered what process?
             │   • Did it reach out to a suspicious IP?
             │   • What files were created or modified?
             │
Step 6 ──► Bob produces structured verdict
             │  level: SAFE | SUSPICIOUS | DANGEROUS
             │  score: 0–100 risk score
             │  summary: plain-language explanation
             │  triggered_rules: list of matched patterns
             │
Step 7 ──► Container destroyed — zero residue on host
             │
Step 8 ──► Dashboard updates live with findings + verdict
             │  User can ask follow-up questions to Bob
             │  Full attack chain shown step-by-step
```

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔒 Disposable Sandboxing
Every scan gets a fresh, isolated Docker container destroyed immediately after analysis. Your host machine is never touched.

### 📡 Real-time Findings Feed
System calls, network connections, and file writes stream live to your dashboard as the install executes.

### 🤖 IBM Bob 2.0 AI Agent
Multi-step agentic reasoning correlates raw telemetry into a coherent threat narrative with full attack-chain reconstruction.

</td>
<td width="50%">

### 🗣️ Interactive Follow-up Q&A
Ask Bob follow-up questions grounded in the specific findings of your scan — not generic advice.

### 📊 Deterministic Verdicts
Always one of three clear outcomes: **SAFE**, **SUSPICIOUS**, or **DANGEROUS** — with an actionable explanation.

### 🔍 Pre-Execution Static Analysis
Scans `package.json` hooks, obfuscated scripts, and dependency patterns before any code ever runs.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI Core** | IBM Bob 2.0 — Agent Mode, Subagents, Repository Understanding |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11+, Pydantic v2, Uvicorn |
| **Sandbox** | Docker, Linux Namespace Isolation, npm lifecycle hooking |
| **Deployment** | Vercel (frontend) · FastAPI Cloud (backend) |
| **CI / VCS** | Git, GitHub |

---

## 📁 Project Structure

```
sentinel-sandbox/
├── backend/
│   ├── agent/
│   │   ├── bob_agent.py          # IBM Bob 2.0 integration & agentic orchestration
│   │   └── security_rules.py     # Threat pattern rule engine
│   ├── api/
│   │   └── routes/
│   │       ├── scans.py          # POST /scans, GET /scans/{id}, SSE findings
│   │       └── health.py         # Health check endpoint
│   ├── app/scanner/
│   │   └── runner.py             # Scan lifecycle orchestrator
│   ├── core/
│   │   ├── static_analyzer.py    # Pre-execution package.json analysis
│   │   ├── security_adapter.py   # Finding normalizer & severity mapper
│   │   └── store.py              # In-memory scan state store
│   ├── sandbox/
│   │   ├── docker_runner.py      # Container spin-up / tear-down
│   │   └── monitor.py            # Runtime telemetry collector
│   ├── services/
│   │   └── scan_service.py       # Business logic & scan lifecycle
│   ├── tests/                    # Automated test suites & vulnerable fixtures
│   ├── main.py                   # FastAPI application entrypoint
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx        # Root layout & global styles
│       │   ├── page.tsx          # Landing page (animated, light/dark theme)
│       │   ├── globals.css       # Design tokens & animation keyframes
│       │   └── dashboard/
│       │       └── page.tsx      # Scan dashboard (live findings + verdict)
│       ├── components/
│       │   ├── ScanForm.tsx      # URL input & scan trigger
│       │   ├── VerdictPanel.tsx  # Verdict display (Safe/Suspicious/Dangerous)
│       │   ├── FindingsFeed.tsx  # Real-time scrolling findings list
│       │   └── FollowUpChat.tsx  # Ask Bob follow-up questions
│       └── lib/
│           ├── api.ts            # Backend API client
│           └── types.ts          # Shared TypeScript interfaces
│
├── ibm-bob-evidence/             # Official Bob 2.0 task session screenshots
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start — Local Development

### Prerequisites

- **Node.js** ≥ 18 · **Python** ≥ 3.11 · **Docker** Desktop running
- An **IBM Bob 2.0** API key (set in `.env`)

### 1. Clone

```bash
git clone https://github.com/usufalbaz/sentinel-sandbox.git
cd sentinel-sandbox
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows PowerShell

pip install -r requirements.txt
cp .env.example .env             # add your IBM Bob API key
uvicorn main:app --reload --port 8000
```

API available at → `http://localhost:8000`  
Swagger UI → `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Dashboard available at → `http://localhost:3000`

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scans` | Submit a new repo URL for scanning |
| `GET` | `/api/scans/{scan_id}` | Poll scan status + verdict |
| `GET` | `/api/scans/{scan_id}/findings` | Stream live findings (SSE) |
| `POST` | `/api/scans/{scan_id}/chat` | Ask Bob a follow-up question |
| `GET` | `/health` | Backend health check |

Full interactive docs → [sentinel-sandbox.fastapicloud.dev/docs](https://sentinel-sandbox.fastapicloud.dev/docs)

---

## 👥 Team Jinx Security AI

> Official entry for the **IBM Bob 2.0 Hackathon**

| Name | Role |
|------|------|
| **Yousuf El-Baz (Mr. G)** | Team Lead · Architecture · Presentation |
| **Eman Mirza** | Full-Stack Lead · Frontend Architecture · Agent Workflow |
| **Junior Antony Maina** | Backend API · Security Engine Integration |
| **Ujjwal Pathak** | API Infrastructure · Pipeline Testing |
| **Aiman Babar** | Security Pattern Research · Test Suites |
| **XenoNOno** | DevOps · Environment Config · Repository Management |

---

## 📄 License

This project is open-source under the **MIT License** — see [`LICENSE`](LICENSE) for details.

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0ea5e9&height=100&section=footer" width="100%" />

**Built with ❤️ at the IBM Bob 2.0 Hackathon · Team Jinx Security AI**

[![Frontend](https://img.shields.io/badge/🚀_Try_It_Live-sentinel--sandbox--kappa.vercel.app-0ea5e9?style=for-the-badge)](https://sentinel-sandbox-kappa.vercel.app/)

</div>
