import { fmt } from "@/lib/dashboard-data";
import { useState, useEffect } from "react";
import AnomalyHeatmap from "./AnomalyHeatmap";
import { AuditService, AuditFinding } from "@/services/audit-service";
import { toast } from "sonner";
import { 
  RefreshCw, Download, User, Calendar, 
  CheckCircle2, AlertCircle, Clock, ShieldCheck,
  ChevronRight, MoreHorizontal
} from "lucide-react";
import { getRecommendedAction } from "@/lib/fuzzy-logic";
import { generateReport } from "@/services/report-service";

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending:         { label: "Pending",     icon: Clock,         color: "text-cost-amber", bg: "bg-cost-amber/10 border-cost-amber/20" },
  in_progress:     { label: "In Progress", icon: RefreshCw,     color: "text-cost-blue",  bg: "bg-cost-blue/10 border-cost-blue/20"   },
  resolved:        { label: "Resolved",    icon: CheckCircle2,  color: "text-cost-green", bg: "bg-cost-green/10 border-cost-green/20" },
  verified:        { label: "Verified",    icon: ShieldCheck,   color: "text-primary",    bg: "bg-primary/10 border-primary/20"       },
  auto_remediated: { label: "Auto-Fixed",  icon: ShieldCheck,   color: "text-cost-green", bg: "bg-cost-green/10 border-cost-green/20" },
};

export default function AnomaliesTab() {
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadFindings();
  }, []);

  async function loadFindings() {
    try {
      const data = await AuditService.getFindings();
      setFindings(data.filter(f => f.tab === "anomalies" || f.finding_id.includes("AF")));
    } catch (err) {
      toast.error("Failed to load audit findings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(id: string, owner: string) {
    try {
      await AuditService.assignFinding(id, owner);
      toast.success(`Assigned to ${owner}`);
      loadFindings();
    } catch (err) {
      toast.error("Assignment failed.");
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    try {
      if (status === "verified") {
        await AuditService.markVerified(id);
      } else {
        await AuditService.remediateFinding(id, status);
      }
      toast.success(`Status updated to ${status}`);
      loadFindings();
    } catch (err) {
      toast.error("Update failed.");
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      await generateReport({ 
        type: "findings", 
        findings, 
        orgName: "Your Organisation", 
        preparedBy: "TrustKit Compliance Engine",
        upload: true
      });
      toast.success("Audit Findings PDF archived & downloaded successfully.");
    } catch {
      toast.error("Failed to generate PDF report.");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <AnomalyHeatmap />
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[14px] font-black text-foreground uppercase tracking-wider">Active Audit Findings</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-mono opacity-60 uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
            {findings.length} findings
          </span>
          <button onClick={handleExport} disabled={exporting || findings.length === 0}
            className="flex items-center gap-1.5 text-[10px] font-black px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all uppercase tracking-widest disabled:opacity-40 shadow-lg shadow-primary/5">
            {exporting ? <RefreshCw size={11} className="animate-spin" /> : <Download size={11} />}
            {exporting ? "Exporting…" : "Export PDF"}
          </button>
        </div>
      </div>

      {findings.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center border-white/5">
          <p className="text-muted-foreground text-sm">No active findings. Run a scan from Settings to begin.</p>
        </div>
      )}

      <div className="space-y-4">
        {findings.map(a => {
          const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
          const StatusIcon = status.icon;
          const isExpanded = expandedId === a.finding_id;

          return (
            <div key={a.finding_id} className={`glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl transition-all duration-300 group ${isExpanded ? "ring-2 ring-primary/20 bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}>
              <div className="p-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : a.finding_id)}>
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight shadow-sm ${
                        a.risk === "critical" ? "bg-primary text-primary-foreground" :
                        a.risk === "high" ? "bg-cost-amber text-black" :
                        "bg-cost-blue text-white"
                      }`}>{a.risk}</span>
                      <span className="text-[9px] font-black text-muted-foreground bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-tighter">
                        AI Score: {a.score}%
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono opacity-40">/{a.finding_id}</span>
                      
                      {a.owner && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-cost-blue uppercase tracking-tighter bg-cost-blue/10 px-2 py-0.5 rounded-full ml-auto">
                          <User size={10} /> {a.owner}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                       <h4 className="text-[16px] font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{a.title}</h4>
                       <ChevronRight size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-1.5 font-medium line-clamp-1">{a.detail}</p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-[22px] font-black font-mono text-cost-green tracking-tighter leading-none">{fmt(a.impact_annual)}</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-50 mt-1">Impact (APY)</p>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${status.bg} ${status.color}`}>
                      <StatusIcon size={12} className={a.status === "in_progress" ? "animate-spin" : ""} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                    </div>
                    
                    {a.due_date ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <Calendar size={12} className="text-primary" />
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                        <Calendar size={12} />
                        No Deadline
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {a.status === "pending" && (
                      <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(a.finding_id, "in_progress"); }}
                        className="text-[10px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors">
                        Mark In Progress
                      </button>
                    )}
                    {a.status === "in_progress" && (
                      <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(a.finding_id, "resolved"); }}
                        className="bg-primary text-primary-foreground text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-primary/20">
                        Resolve Fix
                      </button>
                    )}
                    {a.status === "resolved" && (
                      <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(a.finding_id, "verified"); }}
                        className="bg-cost-green text-black text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-cost-green/20">
                        Verify Audit
                      </button>
                    )}
                    <button className="p-2 text-muted-foreground hover:text-white transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 space-y-4 border-t border-white/5 bg-white/[0.01] animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Governance Assignment</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Assign to (e.g. Srijita C)" 
                          defaultValue={a.owner}
                          onBlur={(e) => handleAssign(a.finding_id, e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[12px] focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <button className="bg-white/5 border border-white/10 rounded-xl px-4 text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                          <User size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Remediation Deadline</p>
                      <div className="flex gap-2">
                        <input 
                          type="date"
                          defaultValue={a.due_date?.split("T")[0]}
                          onChange={(e) => AuditService.updateFinding(a.finding_id, { due_date: e.target.value })}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[12px] focus:outline-none focus:border-primary/50 transition-colors"
                        />
                         <button className="bg-white/5 border border-white/10 rounded-xl px-4 text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                          <Clock size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Remediation Log & Notes</p>
                    <textarea 
                      placeholder="Add audit notes, evidence links or remediation updates..."
                      defaultValue={a.remediation_notes}
                      onBlur={(e) => AuditService.updateFinding(a.finding_id, { remediation_notes: e.target.value })}
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                     <AlertCircle size={14} className="text-primary" />
                     <p className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground">Recommendation:</strong> {getRecommendedAction(a.risk as any)}
                     </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
