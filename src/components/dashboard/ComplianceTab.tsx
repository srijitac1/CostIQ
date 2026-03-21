import { ALL_COMPLIANCE, fmt } from "@/lib/dashboard-data";
import { useState } from "react";

export default function ComplianceTab() {
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  function handleAction(id: string) {
    setStatuses(s => ({ ...s, [id]: "running" }));
    setTimeout(() => setStatuses(s => ({ ...s, [id]: "done" })), 2000);
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">SOC 2 compliance gaps</h3>
        <span className="text-xs text-muted-foreground font-mono">{ALL_COMPLIANCE.length} gaps</span>
      </div>
      {ALL_COMPLIANCE.map(c => {
        const status = statuses[c.id] || c.status;
        return (
          <div key={c.id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cost-amber/15 text-cost-amber uppercase tracking-wider">
                    {c.control}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">{c.id}</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{c.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{c.gap}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.blocked_companies.map(company => (
                    <span key={company} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-mono font-bold text-cost-amber">{fmt(c.revenueAtRisk)}</p>
                <p className="text-[10px] text-muted-foreground">{c.blockedDeals} deals at risk</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Remediation ({c.days} days)</p>
                <p className="text-xs text-foreground">{c.action}</p>
              </div>
              {status === "done" ? (
                <span className="text-xs text-cost-green font-mono">✓ Complete</span>
              ) : status === "running" ? (
                <span className="text-xs text-cost-amber font-mono">Running…</span>
              ) : (
                <button onClick={() => handleAction(c.id)}
                  className="btn-primary text-xs py-1.5 px-4">
                  Run fix
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
