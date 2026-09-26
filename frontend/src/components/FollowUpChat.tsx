"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send } from "lucide-react";
import clsx from "clsx";
import { sendChat } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

interface FollowUpChatProps {
  scanId: string | null;
  isReady: boolean;
}

export default function FollowUpChat({ scanId, isReady }: FollowUpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending || !isReady || !scanId) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setSending(true);
    try {
      const result = await sendChat(scanId, userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div
      className="rounded-2xl flex flex-col shadow-sm"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <Bot size={18} style={{ color: "var(--accent)" }} />
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Ask Bob</span>
        <span className="text-sm" style={{ color: "var(--text-faint)" }}>
          — grounded in this scan&apos;s findings
        </span>
      </div>

      {/* Message list */}
      <div ref={listRef} className="flex-1 overflow-y-auto max-h-72 p-4 flex flex-col gap-3">
        {!isReady ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
            <MessageSquare size={40} style={{ color: "var(--border-mid)" }} />
            <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
              Complete a scan first to ask Bob questions
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
            <MessageSquare size={32} style={{ color: "var(--border-mid)" }} />
            <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
              Ask anything about this scan…
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="bg-sky-500 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-xs text-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="rounded-full p-1.5 flex-shrink-0 mt-1"
                    style={{ background: "var(--accent-dim)" }}
                  >
                    <Bot size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div
                    className="rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs text-sm"
                    style={{ background: "var(--bg-raised)", color: "var(--text-primary)" }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            )}
            {sending && (
              <div className="flex items-start gap-2">
                <div className="rounded-full p-1.5 flex-shrink-0 mt-1" style={{ background: "var(--accent-dim)" }}>
                  <Bot size={14} style={{ color: "var(--accent)" }} />
                </div>
                <div
                  className="rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs text-sm"
                  style={{ background: "var(--bg-raised)" }}
                >
                  <span className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: "var(--text-faint)", animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input bar */}
      <div className="px-3 py-3 flex gap-2" style={{ borderTop: "1px solid var(--border)" }}>
        <input
          className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 transition-colors"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-mid)",
            color: "var(--text-primary)",
          }}
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isReady || sending}
        />
        <button
          className={clsx(
            "bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-3 py-2 transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          onClick={handleSend}
          disabled={!isReady || sending || !input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
