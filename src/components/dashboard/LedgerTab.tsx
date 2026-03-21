export default function LedgerTab() {
  const entries = [
    { date: "2024-01-20", type: "Saving", desc: "Consolidated SaaS licenses", amount: 581000, status: "executed" },
    { date: "2024-01-18", type: "Flag", desc: "Duplicate Twilio invoice held", amount: 280000, status: "pending" },
    { date: "2024-01-15", type: "Saving", desc: "EC2 rightsizing batch 1", amount: 412000, status: "executed" },
    { date: "2024-01-12", type: "Compliance", desc: "SOC 2 CC6 remediation cost", amount: -85000, status: "executed" },
    { date: "2024-01-10", type: "Saving", desc: "Cancelled unused Adobe CC", amount: 12500, status: "executed" },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <h3 className="text-sm font-semibold text-foreground">Savings ledger</h3>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Date</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Type</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Description</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Amount</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    e.type === "Saving" ? "bg-cost-green/15 text-cost-green" :
                    e.type === "Flag" ? "bg-cost-amber/15 text-cost-amber" :
                    "bg-cost-blue/15 text-cost-blue"
                  }`}>{e.type}</span>
                </td>
                <td className="px-4 py-3 text-foreground">{e.desc}</td>
                <td className={`px-4 py-3 text-right font-mono ${e.amount >= 0 ? "text-cost-green" : "text-primary"}`}>
                  {e.amount >= 0 ? "+" : ""}₹{Math.abs(e.amount / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[10px] font-mono ${e.status === "executed" ? "text-cost-green" : "text-cost-amber"}`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
