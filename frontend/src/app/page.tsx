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
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// ── GitHub icon (inline SVG — not in this lucide-react version) ───────────────
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
    /* Outer wrapper: full-width, sticky, transparent edge-to-edge */
    <div className="sticky top-0 z-50 animate-slide-down px-4 py-3"
      style={{ background: "var(--bg)" }}>
      {/* Inner pill — the visible rounded header bar */}
      <div
        className="max-w-6xl mx-auto flex items-center justify-between gap-6 px-5 h-[52px] rounded-2xl"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shadow-md shadow-sky-500/30">
            <ShieldCheck size={15} className="text-white" />
          </div>
          <span className="font-bold text-[14px] tracking-tight" style={{ color: "var(--text-primary)" }}>
            Sentinel Sandbox
          </span>
        </div>

        {/* Centre nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {[
            { href: "#how-it-works", label: "Process"  },
            { href: "#features",     label: "Features"  },
            { href: "#cta",          label: "About"     },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="px-3 py-1.5 rounded-xl transition-colors hover:text-slate-100 hover:bg-white/5"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme toggle */}
          <ThemeToggle />
          {/* GitHub */}
          <a
            href="https://github.com/usufalbaz/sentinel-sandbox"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="nav-icon-btn"
          >
            <GithubIcon size={16} />
          </a>
          {/* Dashboard pill */}
          <Link
            href="/dashboard"
            className="ml-1 inline-flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-all shadow-md shadow-sky-500/20"
          >
            Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-14">
      {/* Background glows */}
      <div aria-hidden className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }} />
      <div aria-hidden className="absolute -bottom-32 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />

      {/* Left column */}
      <div className="relative flex-1 space-y-7">
        {/* Badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: "var(--accent-dim)", border: "1px solid rgba(14,165,233,0.3)", color: "#38bdf8" }}>
          <Zap size={12} />
          Powered by IBM Bob AI
        </div>

        <h1 className="animate-fade-up delay-100 text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
          style={{ color: "var(--text-primary)" }}>
          Analyze any repo.
          <br />
          <span className="text-shimmer">Trust the result.</span>
        </h1>

        <p className="animate-fade-up delay-200 text-lg max-w-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Sentinel Sandbox runs untrusted package install scripts inside a
          disposable VM, monitors every system call, and delivers a
          plain-language safety verdict — powered by IBM Bob.
        </p>

        <div className="animate-fade-up delay-300 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="btn-glow inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-sky-500/30"
            style={{ background: "var(--accent)" }}
          >
            Scan a Repository →
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
          >
            See how it works ↓
          </a>
        </div>

        {/* Trust signals */}
        <div className="animate-fade-up delay-400 flex flex-wrap gap-5 pt-1">
          {[
            { icon: Lock,        label: "Fully isolated VM"       },
            { icon: Eye,         label: "Real-time syscall capture" },
            { icon: ShieldCheck, label: "AI-powered verdict"       },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-faint)" }}>
              <Icon size={13} style={{ color: "var(--accent)" }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right column — terminal */}
      <div className="animate-fade-up delay-300 relative flex-1 w-full animate-float">
        <div aria-hidden className="absolute inset-0 rounded-3xl blur-2xl opacity-20 pointer-events-none"
          style={{ background: "var(--accent)" }} />
        <div className="relative rounded-2xl p-6 font-mono text-sm leading-7 shadow-2xl"
          style={{ background: "#0d1117", border: "1px solid var(--border-mid)" }}>
          {/* macOS dots */}
          <div className="flex items-center gap-1.5 mb-5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs" style={{ color: "var(--text-faint)" }}>sentinel-scan</span>
          </div>
          <p className="terminal-line" style={{ animationDelay: "600ms",  color: "var(--text-faint)" }}>$ sentinel scan https://github.com/evil/pkg</p>
          <p className="terminal-line text-green-400"  style={{ animationDelay: "900ms"  }}>✓ Sandbox created</p>
          <p className="terminal-line text-green-400"  style={{ animationDelay: "1100ms" }}>✓ npm install captured</p>
          <p className="terminal-line text-yellow-400" style={{ animationDelay: "1400ms" }}>⚠ Network call → 203.0.113.45:443</p>
          <p className="terminal-line text-yellow-400" style={{ animationDelay: "1700ms" }}>⚠ File write → /etc/cron.d/backdoor</p>
          <p className="terminal-line text-red-400 font-semibold" style={{ animationDelay: "2000ms" }}>✗ Verdict: DANGEROUS</p>
          <p className="terminal-line text-xs mt-2" style={{ animationDelay: "2300ms", color: "var(--text-faint)" }}>
            Sandbox destroyed. Report ready.<span className="animate-blink ml-0.5">▋</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip() {
  const stats = [
    { value: "7",      label: "documented real attacks"    },
    { value: "0",      label: "files exposed per sandbox"  },
    { value: "100%",   label: "sandbox destroyed after scan" },
    { value: "<2 min", label: "avg scan time"              },
  ];

  return (
    <div style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap justify-center gap-12">
        {stats.map((s, i) => (
          <div key={s.label} className="text-center animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-4xl font-extrabold" style={{ color: "var(--accent)" }}>{s.value}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { number: 1, Icon: LinkIcon,  title: "Submit a Repo URL",          description: "Paste any GitHub or npm package URL. No credentials needed." },
    { number: 2, Icon: Activity,  title: "Bob Monitors the Sandbox",   description: "Every file write, process spawn, and network call is captured in real time." },
    { number: 3, Icon: FileText,  title: "Read the Report",            description: "Bob synthesizes a plain-language verdict with full attack-chain reasoning." },
  ];

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16 animate-fade-up">
        <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>Process</span>
        <h2 className="text-4xl font-extrabold" style={{ color: "var(--text-primary)" }}>How It Works</h2>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
        <div aria-hidden className="hidden md:block absolute top-[18px] left-[16.67%] right-[16.67%] h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--border-mid), transparent)" }} />

        {steps.map(({ number, Icon, title, description }, i) => (
          <div key={number} className={`relative flex flex-col items-start gap-5 animate-fade-up delay-${(i + 1) * 200}`}>
            <div className="flex items-center gap-3">
              <span className="step-number w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0"
                style={{ background: "var(--accent)", boxShadow: "0 0 16px rgba(14,165,233,0.4)" }}>
                {number}
              </span>
              <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
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
    { Icon: Shield,       title: "Disposable Sandbox",      description: "Every run gets a fresh VM destroyed the moment the scan ends.",           accent: "#0ea5e9" },
    { Icon: Activity,     title: "Live Activity Monitor",   description: "Watch system calls stream in real time as the install script executes.",   accent: "#6366f1" },
    { Icon: GitBranch,    title: "Bob Chain Tracing",       description: "Full attack-chain reconstructed step-by-step by IBM Bob.",                accent: "#8b5cf6" },
    { Icon: FileText,     title: "Plain-Language Report",   description: "No jargon — Bob explains exactly what the code tried to do.",             accent: "#06b6d4" },
    { Icon: MessageSquare,title: "Interactive Q&A",         description: "Ask Bob follow-up questions grounded in the specific scan findings.",     accent: "#14b8a6" },
    { Icon: CheckCircle,  title: "Deterministic Verdict",   description: "Safe, Suspicious, or Dangerous — always a clear, actionable answer.",    accent: "#22c55e" },
  ];

  return (
    <section id="features" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-up">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>Features</span>
          <h2 className="text-4xl font-extrabold" style={{ color: "var(--text-primary)" }}>Everything you need to ship safely</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ Icon, title, description, accent }, i) => (
            <div
              key={title}
              className="feature-card rounded-2xl p-6 animate-fade-up"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", animationDelay: `${i * 80}ms` }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                style={{ background: `${accent}18` }}>
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
      <div className="relative overflow-hidden rounded-3xl p-12 text-center"
        style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #0f2445 50%, #0c1a2e 100%)", border: "1px solid var(--border-mid)" }}>
        {/* Glow orbs */}
        <div aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--accent)" }} />
        <div aria-hidden className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "#6366f1" }} />

        <div className="relative animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>
            Ready to scan your next dependency?
          </h2>
          <p className="mb-8 max-w-lg mx-auto text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Paste a GitHub or npm URL and get a full AI-powered security report in under 2 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-glow inline-flex items-center gap-2 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
              style={{ background: "var(--accent)", boxShadow: "0 0 24px rgba(14,165,233,0.35)" }}
            >
              Start Scanning →
            </Link>
            <a
              href="https://github.com/usufalbaz/sentinel-sandbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
              style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
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
    <footer style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* Brand */}
          <div className="space-y-3 max-w-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <ShieldCheck size={17} className="text-white" />
              </div>
              <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Sentinel Sandbox</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered sandbox scanning for package supply-chain security.
              Built for the IBM Bob 2.0 Hackathon.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-10 text-sm">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>Product</p>
              <div className="flex flex-col gap-2">
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
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>Project</p>
              <div className="flex flex-col gap-2">
                <a href="https://github.com/usufalbaz/sentinel-sandbox" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-sky-400">
                  <GithubIcon size={14} /> GitHub
                </a>
                <span>IBM Bob Hackathon 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-faint)" }}>
          <span>© 2025 Sentinel Sandbox. Built at IBM Bob Hackathon.</span>
          <a href="https://github.com/usufalbaz/sentinel-sandbox" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-sky-400">
            <GithubIcon size={13} /> usufalbaz/sentinel-sandbox
          </a>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
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
