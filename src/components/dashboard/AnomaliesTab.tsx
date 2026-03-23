import { ALL_ANOMALIES, fmt } from "@/lib/dashboard-data";
import { useState } from "react";
import AnomalyHeatmap from "./AnomalyHeatmap";

export default function AnomaliesTab() {
  const anomalies = ALL_ANOMALIES.filter(a => a.tab === "anomalies" || a.agent === "Spend");
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  function handleAction(id: string) {
    setStatuses(s => ({ ...s, [id]: "approved" }));
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <AnomalyHeatmap />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Spend anomalies</h3>
        <span className="text-xs text-muted-foreground font-mono">{anomalies.length} findings</span>
      </div>
      {anomalies.map(a => {
        const status = statuses[a.finding_id] || a.status;
        return (
          <div key={a.finding_id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    a.risk === "critical" ? "bg-primary/15 text-primary" :
                    a.risk === "high" ? "bg-cost-amber/15 text-cost-amber" :
                    "bg-cost-blue/15 text-cost-blue"
                  }`}>{a.risk}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{a.finding_id}</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-mono font-bold text-cost-green">{fmt(a.impact.annual_saving)}</p>
                <p className="text-[10px] text-muted-foreground">annual saving</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Proposed action</p>
                <p className="text-xs text-foreground">{a.proposed_action}</p>
              </div>
              {status === "approved" ? (
                <span className="text-xs text-cost-green font-mono">✓ Approved</span>
              ) : (
                <button onClick={() => handleAction(a.finding_id)}
                  className="btn-primary text-xs py-1.5 px-4">
                  Approve
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
