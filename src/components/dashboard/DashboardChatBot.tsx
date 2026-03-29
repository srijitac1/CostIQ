import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, Volume2, VolumeX } from "lucide-react";
import { streamGeminiChat } from "@/lib/gemini";
import { AuditService, AuditFinding } from "@/services/audit-service";

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
    { role: "assistant", content: "Hello. I am Sri, your Gemini-powered governance assistant. I can help you analyze audit findings, optimize for government incentives, or review your compliance posture. How may I assist your operations today?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (open) {
      AuditService.getFindings().then(setFindings).catch(console.error);
    }
  }, [open]);

  async function handleSend() {
    if (!input.trim() || busy) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setBusy(true);

    const context = `
      User currently has ${findings.length} audit findings in their dashboard.
      Findings list (JSON): ${JSON.stringify(findings.map(f => ({ id: f.finding_id, title: f.title, risk: f.risk, impact: f.impact_annual })))}
    `;

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
      // Fallback is handled inside streamGeminiChat
      
      await streamGeminiChat({
        messages: newMsgs,
        context,
        onDelta: upsert,
        onDone: () => {
          setBusy(false);
          speak(assistantSoFar);
        },
        onError: (err) => {
          setMsgs(prev => [...prev, { role: "assistant", content: `⚠ Gemini Error: ${err}` }]);
          setBusy(false);
        },
      });
    } catch (err: any) {
      console.error("Chat Error:", err);
      setMsgs(prev => [...prev, { role: "assistant", content: `⚠ ${err.message || "Connection error"}. Please ensure VITE_GEMINI_API_KEY is set in your .env file.` }]);
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-primary/25 hover:scale-110 transition-all active:scale-95 z-50 border-2 border-primary/20"
        >
          <img src="/sri_avatar.png" alt="Chat with Sri" className="w-full h-full object-cover" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-card/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 shadow-inner">
                  <img src="/sri_avatar.png" alt="Sri" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cost-green border-2 border-background rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground tracking-tight">Sri</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Gemini AI</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                title={voiceEnabled ? "Mute Bot" : "Unmute Bot"}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-5 space-y-4 scrollbar-hide">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1 border border-white/10 shadow-sm">
                    <img src="/sri_avatar.png" alt="Sri" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                    : "bg-white/10 backdrop-blur-md border border-white/10 text-foreground rounded-tl-none"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && msgs[msgs.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start pl-11">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-duration:0.6s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-4 bg-white/5 border-t border-white/10">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 focus-within:border-primary/50 transition-all">
              <button 
                type="button" 
                onClick={startListening} 
                title="Voice Input"
                className={`p-2.5 rounded-lg transition-all ${isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "text-muted-foreground hover:bg-white/10 hover:text-foreground"}`}
              >
                <Mic size={16} />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Message CostIQ..."
                className="flex-1 bg-transparent border-none rounded-lg px-2 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button type="submit" disabled={busy || !input.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-2.5 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary/20">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
