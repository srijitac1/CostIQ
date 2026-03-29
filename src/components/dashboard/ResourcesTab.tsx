import { fmt } from "@/lib/dashboard-data";
import { useState, useEffect } from "react";
import { AuditService, AuditFinding } from "@/services/audit-service";
import { RefreshCw } from "lucide-react";
import { getRecommendedAction } from "@/lib/fuzzy-logic";

export default function ResourcesTab() {
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await AuditService.getFindings();
      setFindings(data.filter(a => a.tab === "resources"));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[13px] font-bold text-foreground">Cloud Optimization Targets</h3>
        <span className="text-[11px] text-muted-foreground font-mono opacity-60 uppercase tracking-widest">{findings.length} Resource Groups Verified</span>
      </div>
      
      {findings.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center border-white/5">
          <p className="text-muted-foreground text-sm">No cloud findings. Run a scan to identify optimization targets.</p>
        </div>
      )}

      {findings.map(a => (
        <div key={a.finding_id} className="glass rounded-2xl overflow-hidden border-white/5 shadow-xl hover:shadow-primary/5 transition-all group">
          <div className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tight shadow-sm ${
                    a.risk === "critical" ? "bg-primary text-primary-foreground" :
                    a.risk === "high" ? "bg-cost-amber text-black" :
                    "bg-cost-blue text-white"
                  }`}>{a.risk}</span>
                  <span className="text-[11px] text-muted-foreground font-mono opacity-50">/{a.finding_id}</span>
                </div>
                <p className="text-[15px] font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">{a.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-2">{a.detail}</p>
                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-60 mb-1">Agent Strategy</p>
                  <p className="text-[13px] text-foreground font-bold">{getRecommendedAction(a.risk as any)}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[20px] font-black font-mono text-cost-green tracking-tighter">{fmt(a.impact_annual)}</p>
                <div className="flex flex-col items-end gap-1 mt-1">
                  {a.status === "auto_remediated" || a.status === "approved" ? (
                    <span className="text-[10px] text-cost-green font-black flex items-center gap-1.5 uppercase tracking-widest whitespace-nowrap">
                      <span className="w-1.5 h-1.5 bg-cost-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                      {a.status === "auto_remediated" ? "Auto-Fixed" : "Approved"}
                    </span>
                  ) : (
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{a.score}% Confidence</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
