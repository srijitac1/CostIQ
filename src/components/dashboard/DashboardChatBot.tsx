import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    onError(body.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError("No response stream"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial chunk */ }
    }
  }
  onDone();
}

export default function DashboardChatBot({ open, setOpen }: Props) {
  const [msgs, setMsgs] = useState<Message[]>([
    { role: "assistant", content: "Hi, I'm Sri — your CostIQ assistant. Ask me about anomalies, compliance gaps, or cost optimization." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function handleSend() {
    if (!input.trim() || busy) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setBusy(true);

    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMsgs(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > newMsgs.length) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev.slice(0, newMsgs.length), { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        onDelta: upsert,
        onDone: () => setBusy(false),
        onError: (err) => {
          setMsgs(prev => [...prev, { role: "assistant", content: `⚠ ${err}` }]);
          setBusy(false);
        },
      });
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", content: "⚠ Connection error. Please try again." }]);
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25 hover:brightness-110 transition-all active:scale-95 z-50"
        >
          <MessageSquare size={18} className="text-primary-foreground" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[480px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">S</span>
              </div>
              <span className="text-sm font-semibold text-foreground">Sri</span>
              <span className="text-[10px] text-muted-foreground">CostIQ Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary/15 text-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && msgs[msgs.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about costs, compliance…"
                className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button type="submit" disabled={busy || !input.trim()}
                className="bg-primary text-primary-foreground rounded p-2 disabled:opacity-50 transition-colors hover:brightness-110 active:scale-95">
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
