# Sentinel Sandbox — Frontend Plan

## Top-Level Overview

Build the complete Sentinel Sandbox frontend from scratch on top of the existing Next.js 14 + Tailwind CSS + TypeScript scaffold. All source files are currently empty. The work covers:

1. **Landing Page** (`/`) — marketing page with hero, how-it-works, features grid, threat-stat counter, and footer.
2. **Dashboard** (`/dashboard`) — the live scan workspace: scan form, verdict panel, findings feed, follow-up chat, scan history sidebar, and stats bar.
3. **Shared foundation** — TypeScript types, API client, and layout/global styles that both pages share.

Design language: clean modern SaaS (white/light backgrounds, professional blues and greens, Vercel/Linear aesthetic). Additional dependencies: `lucide-react`, `clsx`, `react-markdown`.

Backend base URL: `NEXT_PUBLIC_API_URL=http://localhost:8000`
Key endpoints:
- `POST /scan` — submit a repository URL, returns `{ id }`
- `GET /scan/{id}` — poll for results: `{ status, verdict, findings, summary, chain }`
- `POST /scan/{id}/chat` — send a follow-up message, returns `{ reply }`

---

## Sub-Task 1 — Install Additional Dependencies & Shared Foundation

**Intent:** Install the three extra libraries and establish the shared TypeScript types, API client, and global CSS variables that every subsequent component will depend on.

**Expected Outcomes:**
- `lucide-react`, `clsx`, and `react-markdown` are present in `package.json` and `node_modules`.
- `src/lib/types.ts` exports all domain types used across the app.
- `src/lib/api.ts` exports `startScan`, `getScan`, and `sendChat` functions.
- `src/app/globals.css` defines the base Tailwind layers plus any CSS custom properties (color tokens).
- `src/app/layout.tsx` provides the root HTML shell with font, metadata, and global styles.

**Todo List:**
1. Run `npm install lucide-react clsx react-markdown` in `/frontend`.
2. Define types in `src/lib/types.ts`:
   - `ScanStatus` — `"pending" | "running" | "complete" | "error"`
   - `Verdict` — `"safe" | "suspicious" | "dangerous" | "unknown"`
   - `Finding` — `{ id: string; type: string; severity: "info" | "warn" | "critical"; message: string; timestamp: string; process?: string }`
   - `ScanResult` — `{ id: string; repoUrl: string; status: ScanStatus; verdict: Verdict; findings: Finding[]; summary: string; chain: string; createdAt: string }`
   - `ChatMessage` — `{ role: "user" | "assistant"; content: string }`
3. Implement `src/lib/api.ts` with `startScan(repoUrl)`, `getScan(id)`, and `sendChat(id, message)` using `fetch` and `NEXT_PUBLIC_API_URL`.
4. Extend `src/app/globals.css` with CSS custom properties for the brand color palette.
5. Implement `src/app/layout.tsx` — root layout with Inter font (next/font), `<html>`, `<body>`, metadata (`title: "Sentinel Sandbox"`).

**Relevant Context:**
- `frontend/src/lib/types.ts` — currently empty
- `frontend/src/lib/api.ts` — currently empty
- `frontend/src/app/globals.css` — currently only Tailwind imports
- `frontend/src/app/layout.tsx` — currently empty
- `frontend/.env.local.example` — `NEXT_PUBLIC_API_URL=http://localhost:8000`

**Status:** `[ ] pending`

---

## Sub-Task 2 — Landing Page (`/`)

**Intent:** Build a polished marketing landing page at the root route that communicates the product's value proposition and drives users to the dashboard, before any scan functionality is wired up.

**Expected Outcomes:**
- `src/app/page.tsx` renders a complete landing page with five distinct sections.
- The page is fully responsive (mobile → desktop).
- A primary CTA button links to `/dashboard`.
- All sections use the shared color palette established in Sub-Task 1.

**Todo List:**
1. **Hero section** — headline ("Run the Assessment. Safely."), sub-headline summarising the threat, primary CTA button ("Scan a Repository →" → `/dashboard`), secondary CTA ("See how it works" scroll anchor). Include a subtle animated gradient or code-block illustration to the right.
2. **Threat-stat counter strip** — three or four hard-coded statistics (e.g. "7 documented real attacks on our team", "0 files exposed in a sandbox run", "100% disposable — destroyed after scan") as a horizontal band with icon + number + label.
3. **How It Works section** — three numbered steps: "Submit a repo URL", "Bob monitors the sandbox", "Read the plain-language report". Each step has an icon, a short title, and two lines of description.
4. **Features grid** — six feature cards (Disposable Sandbox, Live Activity Monitor, Bob Chain Tracing, Plain-Language Report, Interactive Q&A, Deterministic Verdict). Each card has a Lucide icon, title, and one-sentence description.
5. **Footer** — product name, tagline, "IBM Bob 2.0 Hackathon" attribution, and a link back to the dashboard.
6. Ensure `src/app/page.tsx` imports and assembles all sections; extract each section into a small local component or kept inline — whichever keeps the file readable.

**Relevant Context:**
- `frontend/src/app/page.tsx` — currently empty
- Uses `lucide-react` for icons, `clsx` for conditional classes
- CTA links to `/dashboard` (built in Sub-Task 3)

**Status:** `[ ] pending`

---

## Sub-Task 3 — Dashboard Shell & Layout (`/dashboard`)

**Intent:** Create the `/dashboard` route with the overall two-column layout that hosts all dashboard components. This is the structural skeleton; individual components are filled in subsequent sub-tasks.

**Expected Outcomes:**
- `src/app/dashboard/page.tsx` exists and renders without errors.
- Layout: a narrow left sidebar (scan history + stats bar) and a main content area (scan form, verdict panel, findings feed, chat).
- All component placeholders are imported and render empty/loading states without crashing.
- The active scan ID is managed as local `useState` at the page level and passed as props.

**Todo List:**
1. Create `src/app/dashboard/page.tsx` with a two-column responsive layout using Tailwind grid/flex.
2. Import and place `StatsBar`, `ScanHistory` in the left sidebar.
3. Import and place `ScanForm`, `VerdictPanel`, `FindingsFeed`, `FollowUpChat` in the main column.
4. Add `useState<string | null>` for `activeScanId` and `useState<ScanResult | null>` for `scanResult` — pass them down as props.
5. Add a `useEffect` polling loop: when `activeScanId` is set and `scanResult?.status` is not `"complete"`, call `getScan(activeScanId)` every 2 seconds, update `scanResult`, stop when complete.
6. Add a top navigation bar with the Sentinel Sandbox logo/name and a "New Scan" button.

**Relevant Context:**
- `frontend/src/lib/types.ts` — `ScanResult`, `ScanStatus`
- `frontend/src/lib/api.ts` — `getScan`
- All component files still empty at start of this sub-task

**Status:** `[ ] pending`

---

## Sub-Task 4 — ScanForm Component

**Intent:** Build the repository URL submission form that triggers a new scan and hands the returned scan ID back to the dashboard shell.

**Expected Outcomes:**
- `ScanForm` renders a labeled text input and a "Run Scan" submit button.
- On submit it calls `startScan(repoUrl)`, shows a loading spinner, then calls `onScanStarted(id)` prop.
- Shows inline validation (empty URL) and error state (API failure).
- While a scan is running (prop `isScanning`) the form is disabled with a status indicator.

**Todo List:**
1. Define props: `onScanStarted: (id: string) => void`, `isScanning: boolean`.
2. Add `useState` for `repoUrl`, `loading`, `error`.
3. Render: title ("Scan a Repository"), URL input with placeholder (`https://github.com/user/repo`), submit button with Lucide `Search` icon, error message area.
4. On submit: validate non-empty, call `startScan`, catch errors, call `onScanStarted` on success.
5. Disable input and button while `isScanning` is true; show a `Loader2` spin animation on the button during API call.

**Relevant Context:**
- `frontend/src/components/ScanForm.tsx` — currently empty
- `frontend/src/lib/api.ts` — `startScan`
- `lucide-react`: `Search`, `Loader2` icons

**Status:** `[ ] pending`

---

## Sub-Task 5 — VerdictPanel Component

**Intent:** Display the overall scan verdict (Safe / Suspicious / Dangerous) and Bob's plain-language summary and attack-chain narrative, rendered as markdown.

**Expected Outcomes:**
- `VerdictPanel` shows a prominent verdict badge with color coding: green = safe, amber = suspicious, red = dangerous.
- Bob's `summary` text appears below the badge as plain text.
- Bob's `chain` markdown is rendered using `react-markdown` with appropriate prose styling.
- Shows a skeleton/loading state while `status` is `"pending"` or `"running"`.
- Shows nothing (or a prompt) when no scan has been started yet.

**Todo List:**
1. Define props: `scanResult: ScanResult | null`.
2. Render a verdict badge: map `verdict` → background colour class via `clsx`; display icon (`ShieldCheck`, `ShieldAlert`, `ShieldX` from lucide-react) + label.
3. Render `summary` paragraph below badge.
4. Render `chain` with `<ReactMarkdown>` inside a styled `prose` container.
5. For `status === "pending" | "running"` show animated skeleton placeholder rows.
6. Show a status pill ("Running…" with spinner, or "Complete") in the top-right corner of the panel.

**Relevant Context:**
- `frontend/src/components/VerdictPanel.tsx` — currently empty
- `frontend/src/lib/types.ts` — `ScanResult`, `Verdict`
- `react-markdown` for rendering `chain`
- `lucide-react`: `ShieldCheck`, `ShieldAlert`, `ShieldX`

**Status:** `[ ] pending`

---

## Sub-Task 6 — FindingsFeed Component

**Intent:** Render the live-updating list of raw findings/events captured from the sandbox — file writes, process spawns, network calls, dynamic eval detections.

**Expected Outcomes:**
- `FindingsFeed` renders a scrollable list of `Finding` objects.
- Each row shows: severity icon/pill (color-coded), `type` tag, `message`, `process` (if present), and `timestamp`.
- Critical findings are visually emphasized (red left border or background).
- The list auto-scrolls to the bottom as new findings arrive.
- Shows an empty state ("No findings yet — scan in progress…") when the list is empty.

**Todo List:**
1. Define props: `findings: Finding[]`, `status: ScanStatus`.
2. Use `useRef` on the scroll container and a `useEffect` to auto-scroll on `findings` changes.
3. Map severity → Lucide icon: `info` → `Info` (blue), `warn` → `AlertTriangle` (amber), `critical` → `AlertOctagon` (red).
4. Render each finding as a row with left-border color accent matching severity.
5. Render empty state when `findings.length === 0`.
6. Add a small header showing "Live Findings (N)" with a pulsing green dot while status is `"running"`.

**Relevant Context:**
- `frontend/src/components/FindingsFeed.tsx` — currently empty
- `frontend/src/lib/types.ts` — `Finding`, `ScanStatus`
- `lucide-react`: `Info`, `AlertTriangle`, `AlertOctagon`

**Status:** `[ ] pending`

---

## Sub-Task 7 — FollowUpChat Component

**Intent:** Build the interactive Q&A chat interface where users can ask Bob follow-up questions grounded in the specific scan's findings.

**Expected Outcomes:**
- `FollowUpChat` renders a chat-style message thread and a text input with a send button.
- User messages appear right-aligned; Bob's replies appear left-aligned with a "Bob" avatar/label.
- Sends `POST /scan/{id}/chat` and appends the reply to the local message history.
- Shows a typing indicator while waiting for a reply.
- Disabled (with explanation) when no scan is complete yet.

**Todo List:**
1. Define props: `scanId: string | null`, `isReady: boolean` (true when `status === "complete"`).
2. Add `useState<ChatMessage[]>` for message history.
3. Render message list: user bubble (blue, right), assistant bubble (grey, left) with "Bob" label and a `Bot` Lucide icon.
4. Render input bar: text field + send button (`Send` icon). Disable both while waiting for reply or `!isReady`.
5. On send: append user message, call `sendChat(scanId, message)`, show typing indicator (`"…"` bubble), then append assistant reply.
6. Show a notice "Complete a scan first to ask Bob questions" when `!isReady`.
7. Auto-scroll to the bottom after each new message.

**Relevant Context:**
- `frontend/src/components/FollowUpChat.tsx` — currently empty
- `frontend/src/lib/api.ts` — `sendChat`
- `frontend/src/lib/types.ts` — `ChatMessage`
- `lucide-react`: `Send`, `Bot`

**Status:** `[ ] pending`

---

## Sub-Task 8 — ScanHistory & StatsBar Components

**Intent:** Build the two sidebar components that give context across multiple scans: a list of past scans and an aggregate statistics bar.

**Expected Outcomes:**
- `ScanHistory` renders a clickable list of past `ScanResult` summaries (repo URL truncated, verdict badge, timestamp). Clicking one loads it as the active scan.
- `StatsBar` shows aggregate counters: Total Scans, Dangerous, Suspicious, Safe — derived from the history list.
- Both update reactively when a new scan completes.

**Todo List:**
1. **StatsBar** — props: `history: ScanResult[]`. Derive counts with `Array.filter`. Render four stat tiles (icon + number + label) in a horizontal or 2×2 grid.
   - Icons: `Activity` (total), `ShieldX` (dangerous), `ShieldAlert` (suspicious), `ShieldCheck` (safe).
2. **ScanHistory** — props: `history: ScanResult[]`, `activeScanId: string | null`, `onSelect: (id: string) => void`.
   - Render a vertical list; active scan highlighted.
   - Each row: truncated repo URL, verdict colour pill, relative timestamp.
   - Empty state: "No scans yet."
3. Wire history state up in `src/app/dashboard/page.tsx`: append to a `useState<ScanResult[]>` when a scan completes.

**Relevant Context:**
- `frontend/src/components/StatsBar.tsx` — currently empty
- `frontend/src/components/ScanHistory.tsx` — currently empty
- `frontend/src/lib/types.ts` — `ScanResult`, `Verdict`
- `lucide-react`: `Activity`, `ShieldX`, `ShieldAlert`, `ShieldCheck`

**Status:** `[ ] pending`

---

## Dependency & Ordering

```
Sub-Task 1 (foundation)
    └── Sub-Task 2 (landing page)
    └── Sub-Task 3 (dashboard shell)
            ├── Sub-Task 4 (ScanForm)
            ├── Sub-Task 5 (VerdictPanel)
            ├── Sub-Task 6 (FindingsFeed)
            ├── Sub-Task 7 (FollowUpChat)
            └── Sub-Task 8 (ScanHistory + StatsBar)
```

Sub-Tasks 4–8 can be built in any order once Sub-Task 3 exists, but must be individually wired into the dashboard page as they complete.
