import { ALL_COMPLIANCE, fmt } from "@/lib/dashboard-data";
import { TrendingDown, AlertTriangle, Shield, RefreshCw, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { AuditService, AuditFinding } from "@/services/audit-service";
import { StatutoryService, ComplianceGap } from "@/services/statutory-service";
import { toast } from "sonner";
import AgentOrchestrator from "./AgentOrchestrator";

export default function DashboardTab() {
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [gaps, setGaps] = useState<ComplianceGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [auditData, gapData] = await Promise.all([
          AuditService.getFindings(),
          StatutoryService.getComplianceGaps()
        ]);
        setFindings(auditData);
        if (gapData && gapData.length > 0) {
          setGaps(gapData);
        } else {
          // Fallback
          setGaps(ALL_COMPLIANCE.map(c => ({
            control_id: c.control,
            name: c.name,
            gap_detail: c.gap,
            revenue_at_risk: c.revenueAtRisk,
            blocked_deals: c.blockedDeals,
            action_plan: c.action,
            status: c.status as any
          })));
        }
      } catch (err) {
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSavings = findings.reduce((s, a) => s + (a.impact_annual || 0), 0);
  const criticalCount = findings.filter(a => a.risk === "critical").length;
  const highCount = findings.filter(a => a.risk === "high").length;
  const revenueAtRisk = gaps.reduce((s, c) => s + (c.revenue_at_risk || 0), 0);

  const stats = [
    { label: "Annual savings identified", value: fmt(totalSavings), icon: TrendingDown, color: "text-cost-green" },
    { label: "Critical audit findings", value: String(criticalCount), icon: Shield, color: "text-primary" },
    { label: "High-risk exposures", value: String(highCount), icon: AlertTriangle, color: "text-cost-amber" },
    { label: "Assessed revenue at risk", value: fmt(revenueAtRisk), icon: Shield, color: "text-cost-blue" },
  ];

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Multi-Agent Architecture */}
      <AgentOrchestrator />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-[1.5rem] p-6 border-white/5 bg-white/[0.03] shadow-xl hover:bg-white/[0.05] transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">{s.label}</span>
              <s.icon size={14} className={s.color} />
            </div>
            <p className={`text-2xl font-black font-mono tracking-tighter ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent anomalies */}
        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl bg-white/[0.01]">
          <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="text-[14px] font-black text-foreground uppercase tracking-tight">Critical Governance Exposures</h3>
            <span className="text-[10px] text-muted-foreground font-mono opacity-40">LATEST FINDINGS</span>
          </div>
          <div className="divide-y divide-white/5">
            {findings.filter(f => f.risk === "critical" || f.risk === "high").slice(0, 5).map(a => (
              <div key={a.finding_id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                      a.risk === "critical" ? "bg-primary/20 text-primary border border-primary/20" :
                      a.risk === "high" ? "bg-cost-amber/20 text-cost-amber border border-cost-amber/20" :
                      "bg-cost-blue/20 text-cost-blue border border-cost-blue/20"
                    }`}>{a.risk}</span>
                    <span className="text-[10px] text-muted-foreground font-mono opacity-40 tracking-tighter">AF-{a.finding_id.split('-').pop()}</span>
                  </div>
                  <p className="text-[14px] text-foreground font-bold truncate group-hover:text-primary transition-colors tracking-tight">{a.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[15px] font-black font-mono text-cost-green block tracking-tighter">{fmt(a.impact_annual)}</span>
                </div>
              </div>
            ))}
            {findings.length === 0 && (
              <div className="p-16 text-center text-muted-foreground">
                <p className="text-[11px] font-black uppercase tracking-widest opacity-40">Scan required for audit results</p>
              </div>
            )}
          </div>
        </div>

        {/* Compliance gaps */}
        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl bg-white/[0.01]">
          <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="text-[14px] font-black text-foreground uppercase tracking-tight">Compliance Guardrails</h3>
            <span className="text-[10px] text-muted-foreground font-mono opacity-40">SOC2 / ISO POSTURE</span>
          </div>
          <div className="divide-y divide-white/5">
            {gaps.slice(0, 5).map(c => (
              <div key={c.control_id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Shield size={10} /> {c.control_id}
                    </span>
                    {c.status === "resolved" && <ShieldCheck size={12} className="text-cost-green shadow-[0_0_8px_rgba(34,197,94,0.4)]" />}
                  </div>
                  <p className="text-[14px] text-foreground font-bold truncate tracking-tight">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 opacity-60">{c.gap_detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-black font-mono text-cost-amber tracking-tighter">{fmt(c.revenue_at_risk)}</p>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-40">{c.blocked_deals} DEALS</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
