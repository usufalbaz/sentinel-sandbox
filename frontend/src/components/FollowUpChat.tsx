"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send, Sparkles, Lock } from "lucide-react";
import clsx from "clsx";
import { sendChat } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

interface FollowUpChatProps {
  scanId: string | null;
  isReady: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What was the most dangerous finding?",
  "How can I fix the issues found?",
  "Is this safe to use in production?",
];

export default function FollowUpChat({ scanId, isReady }: FollowUpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending || !isReady || !scanId) return;
    const ts = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: "user", content: msg, timestamp: ts },
    ]);
    setInput("");
    setSending(true);
    try {
      const result = await sendChat(scanId, msg);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: "assistant", content: result.reply, timestamp: new Date().toISOString() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: "assistant",
          content: "Sorry, I encountered an error processing your question. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 0 40px rgba(14,165,233,0.05)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="px-5 py-4 flex items-center gap-3 relative overflow-hidden"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-raised)" }}
      >
        {/* Subtle gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(14,165,233,0.05) 0%, transparent 60%)" }} />

        <div
          className="relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)", boxShadow: "0 0 12px rgba(14,165,233,0.4)" }}
        >
          <Bot size={15} className="text-white" />
        </div>

        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Ask Bob</span>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.2)", color: "#38bdf8" }}
            >
              <Sparkles size={9} /> AI
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: "var(--text-faint)" }}>
            Grounded in this scan&apos;s findings
          </p>
        </div>

        {/* Status */}
        <div className={clsx("relative flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0", isReady
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
          : "border"
        )} style={!isReady ? { background: "var(--bg-raised)", color: "var(--text-faint)", borderColor: "var(--border)" } : {}}>
          <span className={clsx("w-1.5 h-1.5 rounded-full", isReady ? "bg-emerald-400 animate-pulse" : "bg-slate-500")} />
          {isReady ? "Ready" : "Waiting"}
        </div>
      </div>

      {/* ── Message area ────────────────────────────────────────── */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ minHeight: "220px", maxHeight: "320px" }}>
        {!isReady ? (
          /* Locked state */
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
            >
              <Lock size={20} style={{ color: "var(--text-faint)" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Complete a scan to unlock Bob
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
                Ask anything about the scan findings once it's done
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty ready state — show suggestions */
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col items-center gap-2 pt-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)", boxShadow: "0 0 16px rgba(14,165,233,0.3)" }}
              >
                <Bot size={18} className="text-white" />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Bob is ready</p>
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>Ask anything about this scan</p>
            </div>

            {/* Suggested questions */}
            <div className="flex flex-col gap-1.5 mt-1">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left text-xs px-3 py-2 rounded-xl transition-all duration-150 hover:scale-[1.02]"
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(14,165,233,0.3)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <>
            {messages.map((msg) =>
              msg.sender === "user" ? (
                <div key={msg.id} className="flex justify-end chat-bubble-in">
                  <div
                    className="max-w-[75%] text-sm px-4 py-2.5 rounded-2xl rounded-br-sm text-white"
                    style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)" }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2.5 chat-bubble-in">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)", boxShadow: "0 0 8px rgba(14,165,233,0.3)" }}
                  >
                    <Bot size={13} className="text-white" />
                  </div>
                  <div
                    className="max-w-[75%] text-sm px-4 py-2.5 rounded-2xl rounded-bl-sm leading-relaxed"
                    style={{ background: "var(--bg-raised)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            )}

            {/* Typing indicator */}
            {sending && (
              <div className="flex items-start gap-2.5 chat-bubble-in">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)", boxShadow: "0 0 8px rgba(14,165,233,0.3)" }}
                >
                  <Bot size={13} className="text-white" />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-sm"
                  style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
                >
                  <span className="flex items-center gap-1">
                    {[0, 160, 320].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: "var(--accent)", animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Input bar ───────────────────────────────────────────── */}
      <div
        className="px-4 py-3 flex gap-2 items-center"
        style={{ borderTop: "1px solid var(--border)", background: "var(--bg-raised)" }}
      >
        <div className="relative flex-1">
          <input
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-mid)")}
            placeholder={isReady ? "Ask Bob about this scan…" : "Complete a scan first…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isReady || sending}
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={!isReady || sending || !input.trim()}
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all btn-glow",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          )}
          style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)" }}
        >
          <Send size={15} className="text-white" style={{ transform: "translateX(1px)" }} />
        </button>
      </div>
    </div>
  );
}
