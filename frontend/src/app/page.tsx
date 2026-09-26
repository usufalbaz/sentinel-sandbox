import Link from "next/link";
import {
  Activity,
  CheckCircle,
  FileText,
  GitBranch,
  Link as LinkIcon,
  MessageSquare,
  Shield,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  ArrowRight,
  Star,
  Cpu,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
    </svg>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <div className="sticky top-0 z-50 animate-slide-down px-4 py-3" style={{ background: "transparent" }}>
      <div
        className="max-w-6xl mx-auto flex items-center justify-between gap-6 px-5 h-[56px] rounded-2xl"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(14,165,233,0.08)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
              boxShadow: "0 0 16px rgba(14,165,233,0.5)",
            }}
          >
            <ShieldCheck size={15} className="text-white" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-[14px] tracking-tight" style={{ color: "var(--text-primary)" }}>Sentinel</span>
            <span className="font-bold text-[14px] tracking-tight text-sky-400"> Sandbox</span>
          </div>
        </div>

        {/* Centre nav links — always dark-themed */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {[
            { href: "#how-it-works", label: "Process" },
            { href: "#features",     label: "Features" },
            { href: "#cta",          label: "About" },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="px-3.5 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <a href="https://github.com/usufalbaz/sentinel-sandbox" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="nav-icon-btn">
            <GithubIcon size={16} />
          </a>
          <Link
            href="/dashboard"
            className="ml-1 inline-flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all btn-glow"
            style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%)" }}
          >
            Dashboard <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      {/* Large glow orbs */}
      <div aria-hidden className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none animate-glow-pulse"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)" }} />
      <div aria-hidden className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none animate-glow-pulse"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", animationDelay: "1.2s" }} />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 md:pt-28 md:pb-36 flex flex-col md:flex-row items-center gap-16">
        {/* Left */}
        <div className="relative flex-1 space-y-7">
          {/* Badge */}
          <div className="animate-rise inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(99,102,241,0.15) 100%)",
              border: "1px solid rgba(14,165,233,0.3)",
              color: "#38bdf8",
            }}>
            <Zap size={11} className="text-sky-400" />
            Powered by IBM Bob AI &nbsp;·&nbsp;
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400">Hackathon 2026</span>
          </div>

          <h1 className="animate-rise delay-100 text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight"
            style={{ color: "var(--text-primary)" }}>
            Analyze any repo.
            <br />
            <span
              className="animate-gradient-x"
              style={{
                background: "linear-gradient(90deg, #38bdf8, #818cf8, #0ea5e9, #34d399)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Trust the result.
            </span>
          </h1>

          <p className="animate-rise delay-200 text-lg max-w-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Sentinel Sandbox runs untrusted install scripts inside a disposable VM,
            monitors every system call, and delivers a plain-language safety verdict —
            powered by IBM Bob.
          </p>

          <div className="animate-rise delay-300 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="btn-glow inline-flex items-center gap-2 text-white text-sm font-bold px-7 py-3.5 rounded-xl transition-all"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", boxShadow: "0 0 30px rgba(14,165,233,0.4)" }}
            >
              Start Scanning <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-xl transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.18)", color: "var(--text-muted)" }}
            >
              See how it works ↓
            </a>
          </div>

          {/* Trust badges */}
          <div className="animate-rise delay-400 flex flex-wrap gap-4 pt-1">
            {[
              { icon: Lock,        label: "Isolated VM"         },
              { icon: Eye,         label: "Real-time monitoring" },
              { icon: ShieldCheck, label: "AI-powered verdict"   },
              { icon: Cpu,         label: "IBM Bob engine"       },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-faint)" }}>
                <Icon size={12} className="text-sky-400" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right — terminal */}
        <div className="animate-rise delay-200 relative flex-1 w-full max-w-lg animate-float">
          {/* Glow behind terminal */}
          <div aria-hidden className="absolute inset-0 rounded-3xl blur-3xl opacity-30 pointer-events-none"
            style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)", transform: "scale(0.9) translateY(20px)" }} />

          {/* Terminal window */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Scan line overlay */}
            <div className="scan-overlay" />

            {/* Titlebar */}
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ background: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="flex-1 text-center text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                sentinel-sandbox — bash
              </span>
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono text-sm leading-7">
              <p className="terminal-line" style={{ animationDelay: "600ms",  color: "rgba(148,163,184,0.7)" }}>$ sentinel scan https://github.com/evil/pkg</p>
              <p className="terminal-line" style={{ animationDelay: "900ms",  color: "#4ade80" }}>✓ Sandbox VM created</p>
              <p className="terminal-line" style={{ animationDelay: "1100ms", color: "#4ade80" }}>✓ npm install captured</p>
              <p className="terminal-line" style={{ animationDelay: "1350ms", color: "#4ade80" }}>✓ Static analysis complete</p>
              <p className="terminal-line" style={{ animationDelay: "1600ms", color: "#fbbf24" }}>⚠ Network call → 203.0.113.45:443</p>
              <p className="terminal-line" style={{ animationDelay: "1900ms", color: "#fbbf24" }}>⚠ File write → /etc/cron.d/backdoor</p>
              <p className="terminal-line font-bold" style={{ animationDelay: "2200ms", color: "#f87171" }}>✗ Verdict: <span style={{ color: "#ef4444" }}>DANGEROUS</span></p>
              <p className="terminal-line text-xs mt-2" style={{ animationDelay: "2500ms", color: "rgba(148,163,184,0.5)" }}>
                Sandbox destroyed. Report ready.<span className="animate-blink ml-0.5" style={{ color: "#38bdf8" }}>▋</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { value: "7",      label: "real attack vectors detected", color: "#f87171" },
    { value: "0",      label: "files exposed per sandbox",    color: "#4ade80" },
    { value: "100%",   label: "sandbox isolated & destroyed", color: "#38bdf8" },
    { value: "<2 min", label: "average scan time",            color: "#a78bfa" },
  ];

  return (
    <div style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="text-center animate-rise p-5 rounded-2xl"
              style={{
                animationDelay: `${i * 100}ms`,
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
              }}
            >
              <p className="text-4xl font-extrabold tracking-tight" style={{ color: s.color }}>{s.value}</p>
              <p className="mt-1.5 text-xs leading-snug" style={{ color: "var(--text-faint)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      number: 1, Icon: LinkIcon,
      title: "Submit a Repo URL",
      description: "Paste any GitHub URL and choose a branch. No credentials or local setup needed.",
      accent: "#0ea5e9",
    },
    {
      number: 2, Icon: Activity,
      title: "Bob Monitors the Sandbox",
      description: "Every file write, process spawn, and network call is captured live in an isolated VM.",
      accent: "#8b5cf6",
    },
    {
      number: 3, Icon: FileText,
      title: "Read the Report",
      description: "Bob synthesises a plain-language verdict with full attack-chain reasoning you can act on.",
      accent: "#22c55e",
    },
  ];

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
          style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", color: "#38bdf8" }}
        >
          <Activity size={11} /> Process
        </span>
        <h2 className="text-4xl font-extrabold" style={{ color: "var(--text-primary)" }}>How It Works</h2>
        <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          Three steps from URL to actionable security verdict.
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connector line */}
        <div aria-hidden className="hidden md:block absolute top-[22px] left-[22%] right-[22%] h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent)" }} />

        {steps.map(({ number, Icon, title, description, accent }, i) => (
          <div
            key={number}
            className="relative flex flex-col gap-5 p-6 rounded-2xl animate-rise feature-card"
            style={{
              animationDelay: `${i * 150}ms`,
              background: "var(--bg-surface)",
              border: `1px solid var(--border)`,
            }}
          >
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ background: accent }} />

            <div className="flex items-center gap-3">
              <span
                className="step-number w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, boxShadow: `0 0 18px ${accent}50` }}
              >
                {number}
              </span>
              <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features grid ─────────────────────────────────────────────────────────────
function FeaturesGrid() {
  const features = [
    { Icon: Shield,        title: "Disposable Sandbox",    description: "Every run gets a fresh VM destroyed the moment the scan ends.",                accent: "#0ea5e9" },
    { Icon: Activity,      title: "Live Activity Monitor", description: "Watch system calls stream in real time as the install script executes.",         accent: "#6366f1" },
    { Icon: GitBranch,     title: "Bob Chain Tracing",     description: "Full attack-chain reconstructed step-by-step by IBM Bob.",                      accent: "#8b5cf6" },
    { Icon: FileText,      title: "Plain-Language Report", description: "No jargon — Bob explains exactly what the code tried to do.",                   accent: "#06b6d4" },
    { Icon: MessageSquare, title: "Interactive Q&A",       description: "Ask Bob follow-up questions grounded in the specific scan findings.",           accent: "#14b8a6" },
    { Icon: CheckCircle,   title: "Deterministic Verdict", description: "Safe, Suspicious, or Dangerous — always a clear, actionable answer.",           accent: "#22c55e" },
  ];

  return (
    <section id="features" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8" }}
          >
            <Zap size={11} /> Features
          </span>
          <h2 className="text-4xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Everything you need to ship safely
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ Icon, title, description, accent }, i) => (
            <div
              key={title}
              className="feature-card relative rounded-2xl p-6 animate-rise overflow-hidden group"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 0%, ${accent}12 0%, transparent 70%)` }}
              />
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                style={{ background: `${accent}18`, border: `1px solid ${accent}25` }}
              >
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section id="cta" className="max-w-6xl mx-auto px-6 py-20">
      <div
        className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center dot-grid"
        style={{
          background: "linear-gradient(135deg, #0a0f1a 0%, #0c1535 40%, #0d1a2e 70%, #0a0f1a 100%)",
          border: "1px solid rgba(14,165,233,0.15)",
          boxShadow: "0 0 80px rgba(14,165,233,0.08)",
        }}
      >
        {/* Orbs */}
        <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none animate-glow-pulse"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)" }} />
        <div aria-hidden className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-glow-pulse"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", animationDelay: "1s" }} />

        <div className="relative animate-rise">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-6"
            style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.25)", color: "#38bdf8" }}
          >
            <Zap size={11} /> Free &amp; Open Source
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: "#f1f5f9" }}>
            Ready to scan your
            <br />
            <span
              className="animate-gradient-x"
              style={{
                background: "linear-gradient(90deg, #38bdf8, #818cf8, #34d399, #38bdf8)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              next dependency?
            </span>
          </h2>

          <p className="mb-10 max-w-lg mx-auto text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Paste a GitHub URL and get a full AI-powered security report in under 2 minutes.
            No account required.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-glow inline-flex items-center gap-2 text-white text-sm font-bold px-8 py-4 rounded-xl transition-all"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", boxShadow: "0 0 30px rgba(14,165,233,0.4)" }}
            >
              Start Scanning <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/usufalbaz/sentinel-sandbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-4 rounded-xl transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
            >
              <GithubIcon size={16} />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Brand */}
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%)", boxShadow: "0 0 14px rgba(14,165,233,0.4)" }}
              >
                <ShieldCheck size={16} className="text-white" />
              </div>
              <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Sentinel Sandbox</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              AI-powered sandbox scanning for package supply-chain security.
              Built for the IBM Bob 2.0 Hackathon.
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-faint)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-10 text-sm">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Product</p>
              <div className="flex flex-col gap-2.5" style={{ color: "var(--text-muted)" }}>
                {[
                  { href: "/dashboard",    label: "Dashboard",    isNext: true  },
                  { href: "#how-it-works", label: "How It Works", isNext: false },
                  { href: "#features",     label: "Features",     isNext: false },
                ].map(({ href, label, isNext }) =>
                  isNext
                    ? <Link key={label} href={href} className="transition-colors hover:text-sky-400">{label}</Link>
                    : <a    key={label} href={href} className="transition-colors hover:text-sky-400">{label}</a>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Project</p>
              <div className="flex flex-col gap-2.5" style={{ color: "var(--text-muted)" }}>
                <a href="https://github.com/usufalbaz/sentinel-sandbox" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-sky-400">
                  <GithubIcon size={13} /> GitHub Repo
                </a>
                <span>IBM Bob Hackathon 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-faint)" }}
        >
          <span>© 2025 Sentinel Sandbox. Built at IBM Bob Hackathon.</span>
          <a href="https://github.com/usufalbaz/sentinel-sandbox" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-sky-400">
            <GithubIcon size={12} /> usufalbaz/sentinel-sandbox
          </a>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <HowItWorks />
        <FeaturesGrid />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}