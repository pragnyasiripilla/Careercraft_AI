import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";

function ChatBubble({ role, text, subtle = false }) {
  const isUser = role === "user";
  return (
    <div className={["flex", isUser ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-lg",
          isUser
            ? "bg-white text-slate-950 shadow-white/10"
            : "bg-white/10 text-slate-100 shadow-black/20 border border-white/10",
          subtle ? "opacity-80" : "opacity-100",
          "transition-all duration-200 ease-out",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}

function toHistory(messages, limit = 10) {
  const trimmed = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role, content: String(m.content || "") }))
    .filter((m) => m.content.trim().length > 0);
  return trimmed.slice(Math.max(0, trimmed.length - limit));
}

export function ChatbotPanel() {
  const { profile, recommendations } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: "m1",
      role: "assistant",
      content:
        "Hi — I’m your career copilot. Ask me anything about roles, learning plans, portfolio projects, or getting job-ready.",
    },
  ]);

  const isLanding = location.pathname === "/";
  const show = useMemo(() => !isLanding, [isLanding]);

  const scrollerRef = useRef(null);

  function scrollToBottomSoon() {
    window.setTimeout(() => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 0);
  }

  useEffect(() => {
    if (!open) return;
    scrollToBottomSoon();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    scrollToBottomSoon();
  }, [open, messages.length, isThinking]);

  async function send(nextText) {
    const text = String(nextText ?? draft).trim();
    if (!text) return;
    if (isThinking) return;

    setDraft("");

    const userMsg = { id: `u-${Date.now()}`, role: "user", content: text };
    const base = [...messages, userMsg];
    setMessages(base);
    setIsThinking(true);
    scrollToBottomSoon();

    try {
      const endpoint = "http://localhost:5000/chat";
      const token = localStorage.getItem("cc_token");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          chatHistory: toHistory(base, 10),
          userProfile: {
            skills: profile.skills,
            interests: profile.interests,
            goals: profile.goals,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      const replyText =
        String(data?.text || "").trim() ||
        "I can help—tell me your target role, timeline, and current skills, and I’ll propose a plan.";

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now() + 1}`, role: "assistant", content: replyText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now() + 1}`,
          role: "assistant",
          content:
            "I’m having trouble reaching the AI right now. Share your target role + timeline + 3–5 skills, and I’ll draft a 2-week action plan.",
        },
      ]);
    } finally {
      setIsThinking(false);
      scrollToBottomSoon();
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[340px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/40 backdrop-blur md:w-[380px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">CareerCraft Chat</p>
              <p className="truncate text-xs text-slate-300">
                Ask about roles, learning plans, portfolio ideas
              </p>
            </div>
            <button
              className="rounded-lg px-2 py-1 text-sm text-slate-200 hover:bg-white/5"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {[
                "Suggest projects",
                "How to get a job in 3 months?",
                "Best skills for me",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={isThinking}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-60"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="max-h-[360px] space-y-3 overflow-auto p-4"
          >
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} text={m.content} />
            ))}

            {isThinking && (
              <ChatBubble role="assistant" text="AI is thinking…" subtle />
            )}

            {recommendations.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                Tip: Fill out your profile to unlock tailored recommendations.{" "}
                <button
                  className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
                  onClick={() => {
                    setOpen(false);
                    navigate("/onboarding");
                  }}
                >
                  Go to profile
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Ask a question…"
                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20"
              />
              <button
                onClick={() => send()}
                disabled={isThinking}
                className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:bg-white/90 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/30 backdrop-blur transition hover:bg-white/15"
        aria-label="Toggle chatbot"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/20">
          AI
        </span>
        <span className="hidden md:inline">
          {open ? "Close chat" : "Ask CareerCraft"}
        </span>
      </button>
    </div>
  );
}

