import { ALL_ANOMALIES, ALL_COMPLIANCE, fmt } from "@/lib/dashboard-data";
import { TrendingDown, AlertTriangle, Shield, Clock } from "lucide-react";

export default function DashboardTab() {
  const totalSavings = ALL_ANOMALIES.reduce((s, a) => s + (a.impact.annual_saving || 0), 0);
  const criticalCount = ALL_ANOMALIES.filter(a => a.risk === "critical").length;
  const highCount = ALL_ANOMALIES.filter(a => a.risk === "high").length;
  const revenueAtRisk = ALL_COMPLIANCE.reduce((s, c) => s + c.revenueAtRisk, 0);

  const stats = [
    { label: "Total annual savings found", value: fmt(totalSavings), icon: TrendingDown, color: "text-cost-green" },
    { label: "Critical anomalies", value: String(criticalCount), icon: AlertTriangle, color: "text-primary" },
    { label: "High-risk findings", value: String(highCount), icon: AlertTriangle, color: "text-cost-amber" },
    { label: "Revenue at risk (compliance)", value: fmt(revenueAtRisk), icon: Shield, color: "text-cost-blue" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon size={14} className={s.color} />
            </div>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent anomalies */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent findings</h3>
        </div>
        <div className="divide-y divide-border">
          {ALL_ANOMALIES.slice(0, 5).map(a => (
            <div key={a.finding_id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    a.risk === "critical" ? "bg-primary/15 text-primary" :
                    a.risk === "high" ? "bg-cost-amber/15 text-cost-amber" :
                    "bg-cost-blue/15 text-cost-blue"
                  }`}>{a.risk}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{a.agent}</span>
                </div>
                <p className="text-sm text-foreground truncate">{a.title}</p>
              </div>
              <span className="text-sm font-mono text-cost-green shrink-0">{fmt(a.impact.annual_saving)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance gaps */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">SOC 2 compliance gaps</h3>
        </div>
        <div className="divide-y divide-border">
          {ALL_COMPLIANCE.map(c => (
            <div key={c.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-foreground">{c.control} — {c.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.gap}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono text-cost-amber">{fmt(c.revenueAtRisk)}</p>
                <p className="text-[10px] text-muted-foreground">{c.blockedDeals} deals blocked</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
