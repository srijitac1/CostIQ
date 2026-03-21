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

  function handleSend() {
    if (!input.trim() || busy) return;
    const userMsg = input.trim();
    setMsgs(m => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setBusy(true);

    // Simulated response
    setTimeout(() => {
      setMsgs(m => [...m, {
        role: "assistant",
        content: "I found relevant findings in your data. Check the Anomalies tab for detailed cost optimization recommendations, or ask me about specific areas like SaaS spend, cloud resources, or compliance gaps.",
      }]);
      setBusy(false);
    }, 1200);
  }

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25 hover:brightness-110 transition-all active:scale-95 z-50"
        >
          <MessageSquare size={18} className="text-primary-foreground" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[480px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
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

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary/15 text-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
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

          {/* Input */}
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
