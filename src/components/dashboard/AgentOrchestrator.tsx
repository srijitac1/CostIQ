import { useState, useEffect, useCallback } from "react";
import {
  Shield, TrendingDown, Server, Clock, Receipt,
  CheckCircle, AlertTriangle, Zap, Play, Square,
  RefreshCw, ExternalLink, Activity, GitBranch
} from "lucide-react";
import {
  trustKitOrchestrator,
  OrchestratorState,
  OrchestratorEvent,
  AgentId,
  AgentRunStatus,
} from "@/services/agent-orchestrator";

// ─── Sub-agent config ────────────────────────────────────────
const AGENTS: Array<{
  id: AgentId;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  colorBg: string;
}> = [
  { id: "spend",    name: "Spend Agent",    role: "SaaS & License Audit",       icon: TrendingDown, color: "text-cost-green", colorBg: "bg-cost-green/10 border-cost-green/20"   },
  { id: "resource", name: "Resource Agent", role: "Cloud Infrastructure",        icon: Server,       color: "text-cost-blue",  colorBg: "bg-cost-blue/10 border-cost-blue/20"     },
  { id: "sla",      name: "SLA Agent",      role: "Contract Compliance",         icon: Clock,        color: "text-primary",    colorBg: "bg-primary/10 border-primary/20"         },
  { id: "finops",   name: "FinOps Agent",   role: "Billing & Invoice Audit",     icon: Receipt,      color: "text-cost-amber", colorBg: "bg-cost-amber/10 border-cost-amber/20"   },
];

const STATUS_CONF: Record<AgentRunStatus, { label: string; dot: string; spin?: boolean }> = {
  idle:       { label: "Standby",   dot: "bg-muted-foreground/40"                              },
  scheduled:  { label: "Queued",    dot: "bg-primary/60 animate-pulse"                        },
  running:    { label: "Scanning",  dot: "bg-primary animate-pulse",    spin: true             },
  reporting:  { label: "Reporting", dot: "bg-cost-amber animate-pulse"                        },
  done:       { label: "Done",      dot: "bg-cost-green shadow-[0_0_6px_rgba(34,197,94,.5)]"  },
  error:      { label: "Error",     dot: "bg-destructive"                                      },
};

const SEVERITY_CONF: Record<OrchestratorEvent["severity"], { border: string; dot: string; text: string }> = {
  info:     { border: "border-white/5",           dot: "bg-muted-foreground/50",  text: "text-muted-foreground" },
  success:  { border: "border-cost-green/20",      dot: "bg-cost-green",           text: "text-cost-green"       },
  warn:     { border: "border-cost-amber/20",      dot: "bg-cost-amber",           text: "text-cost-amber"       },
  critical: { border: "border-primary/30",         dot: "bg-primary",              text: "text-primary"          },
};

// ─── Countdown hook ──────────────────────────────────────────
function useCountdown(targetMs: number) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const tick = () => setSecs(Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)));
    tick();
    const int = setInterval(tick, 1000);
    return () => clearInterval(int);
  }, [targetMs]);
  return secs;
}

// ─── Main Component ──────────────────────────────────────────
export default function AgentOrchestrator() {
  const [state, setState] = useState<OrchestratorState>(() => trustKitOrchestrator.getState());
  const countdown = useCountdown(state.next_cycle_at);

  // Subscribe to orchestrator state changes
  useEffect(() => {
    const unsub = trustKitOrchestrator.subscribe(setState);
    return unsub;
  }, []);

  const handleStart  = useCallback(() => trustKitOrchestrator.start(),         []);
  const handleStop   = useCallback(() => trustKitOrchestrator.stop(),          []);
  const handleManual = useCallback(() => trustKitOrchestrator.triggerManual(), []);

  const anyCycleRunning = Object.values(state.agent_statuses).some(s => s === "running" || s === "scheduled" || s === "reporting");
  const totalReported = Object.values(state.last_reports).reduce((s, r) => s + (r?.findings.length ?? 0), 0);

  return (
    <div className="space-y-4">

      {/* ── TrustKit Master Agent ─────────────────────────── */}
      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="relative p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-white/5">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Identity */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`absolute -inset-2 rounded-full bg-primary/10 ${state.running ? "animate-ping" : ""} opacity-20`} />
                <div className="relative w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
                  <Shield className="text-primary" size={24} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Master Orchestrator</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${state.running ? "bg-cost-green animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-muted-foreground/40"}`} />
                  {state.running && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-cost-green/10 border border-cost-green/20 text-cost-green px-2 py-0.5 rounded-full">
                      Auto-running · Cycle #{state.cycle}
                    </span>
                  )}
                </div>
                <h2 className="text-[20px] font-black text-foreground tracking-tight">TrustKit</h2>
                <p className="text-[12px] text-muted-foreground font-medium">
                  Compliance Intelligence Engine · 4 sub-agents
                  {state.running && countdown > 0 && (
                    <span className="ml-2 font-mono text-primary/70">· next cycle in {countdown}s</span>
                  )}
                </p>
              </div>
            </div>

            {/* Stats + Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-5 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-center">
                  <p className="text-[19px] font-black font-mono text-foreground">{totalReported}</p>
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Findings</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[19px] font-black font-mono text-foreground">{state.cycle}</p>
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Cycles</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[19px] font-black font-mono text-foreground">{state.event_log.length}</p>
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Events</p>
                </div>
              </div>

              {/* Action buttons */}
              {!state.running ? (
                <button onClick={handleStart}
                  className="flex items-center gap-2 bg-cost-green hover:bg-cost-green/90 text-black text-[11px] font-black py-2.5 px-5 rounded-xl shadow-lg shadow-cost-green/20 transition-all active:scale-95 uppercase tracking-widest">
                  <Play size={13} /> Start Autonomous
                </button>
              ) : (
                <button onClick={handleStop}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-foreground text-[11px] font-black py-2.5 px-5 rounded-xl border border-white/10 transition-all active:scale-95 uppercase tracking-widest">
                  <Square size={13} /> Stop
                </button>
              )}
              <button onClick={handleManual} disabled={anyCycleRunning}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black py-2.5 px-5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50">
                {anyCycleRunning ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                {anyCycleRunning ? "Running…" : "Manual Scan"}
              </button>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex justify-center py-1 relative">
          <div className="w-px h-4 bg-gradient-to-b from-primary/30 to-white/5" />
          <div className="absolute bottom-0 left-[12%] w-[76%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ── Sub-agents ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-white/5">
          {AGENTS.map(agent => {
            const status = state.agent_statuses[agent.id] ?? "idle";
            const conf   = STATUS_CONF[status];
            const report = state.last_reports[agent.id];
            const Icon   = agent.icon;

            return (
              <div key={agent.id}
                className={`p-5 flex flex-col gap-3 transition-all duration-500 ${status === "running" ? "bg-primary/5" : "hover:bg-white/[0.03]"}`}>

                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl border ${agent.colorBg} flex items-center justify-center transition-all ${status === "running" ? "scale-105 shadow-lg" : ""}`}>
                    <Icon size={18} className={`${agent.color} ${status === "running" ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                    {conf.spin && <RefreshCw size={10} className="text-primary animate-spin" />}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.15em] text-muted-foreground mb-0.5">Sub-Agent</p>
                  <p className="text-[13px] font-black text-foreground">{agent.name}</p>
                  <p className={`text-[10px] font-bold ${agent.color} uppercase tracking-tighter`}>{agent.role}</p>
                </div>

                {report ? (
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{report.summary}</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground opacity-60">
                    {status === "running" ? <span className="text-primary animate-pulse">Executing audit workflow…</span>
                      : status === "scheduled" ? "Queued by TrustKit…"
                      : "Awaiting dispatch"}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    status === "done" ? "text-cost-green" : status === "running" ? "text-primary" : status === "error" ? "text-destructive" : "text-muted-foreground"
                  }`}>{conf.label}</span>
                  <span className="text-[11px] font-black font-mono text-foreground">
                    {report ? `${report.findings.length} findings` : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <GitBranch size={11} className="text-primary/60" />
            {state.running
              ? <span>All sub-agents reporting to <span className="text-primary font-black">TrustKit</span> · Next scan in <span className="font-black text-foreground">{countdown}s</span></span>
              : <span><span className="text-primary font-black">TrustKit</span> · Multi-Agent Governance Architecture · Auto-schedule disabled</span>}
          </div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">TrustKit™ Orchestration Engine v1.2</p>
        </div>
      </div>

      {/* ── Live Activity Log ─────────────────────────────── */}
      {state.event_log.length > 0 && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              <span className="text-[12px] font-black text-foreground">Live Orchestration Log</span>
              {state.running && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{state.event_log.length} events</span>
          </div>
          <div className="max-h-[280px] overflow-auto divide-y divide-white/5">
            {state.event_log.map(evt => {
              const sev = SEVERITY_CONF[evt.severity];
              return (
                <div key={evt.id} className={`px-5 py-3 flex items-start gap-3 border-l-2 ${sev.border} hover:bg-white/5 transition-colors`}>
                  <div className="flex-shrink-0 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full block ${sev.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      {evt.agent_id && (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-muted-foreground">
                          {evt.agent_id}
                        </span>
                      )}
                      <span className="text-[8px] text-muted-foreground font-mono opacity-50">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium ${sev.text}`}>{evt.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
