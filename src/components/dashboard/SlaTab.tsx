import { ALL_ANOMALIES, fmt } from "@/lib/dashboard-data";

export default function SlaTab() {
  const sla = ALL_ANOMALIES.filter(a => a.tab === "sla");
  return (
    <div className="space-y-4 animate-fade-up">
      <h3 className="text-sm font-semibold text-foreground">SLA breach monitoring</h3>
      {sla.map(a => (
        <div key={a.finding_id} className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  a.risk === "critical" ? "bg-primary/15 text-primary" : "bg-cost-amber/15 text-cost-amber"
                }`}>{a.risk}</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.detail}</p>
              <p className="text-xs text-foreground mt-2">{a.proposed_action}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-mono font-bold text-cost-amber">{fmt(a.impact.annual_saving)}</p>
              <p className="text-[10px] text-muted-foreground">penalty exposure</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
