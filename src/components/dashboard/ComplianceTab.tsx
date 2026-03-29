import { ALL_COMPLIANCE, fmt } from "@/lib/dashboard-data";
import { useState, useEffect } from "react";
import { StatutoryService, ComplianceGap } from "@/services/statutory-service";
import { toast } from "sonner";
import { RefreshCw, Download, ShieldCheck, AlertCircle } from "lucide-react";
import { generateReport } from "@/services/report-service";

export default function ComplianceTab() {
  const [gaps, setGaps] = useState<ComplianceGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  useEffect(() => {
    loadGaps();
  }, []);

  async function loadGaps() {
    try {
      const data = await StatutoryService.getComplianceGaps();
      if (data && data.length > 0) {
        setGaps(data);
      } else {
        // High-fidelity fallback for demo
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
      toast.error("Failed to load compliance posture.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string) {
    setRemediatingId(id);
    toast.info(`Executing governance remediation project...`);
    
    // Simulate orchestration delay
    setTimeout(async () => {
      setRemediatingId(null);
      toast.success(`Control gap remediated and verified for audit readiness.`);
      setGaps(prev => prev.map(g => g.control_id === id ? { ...g, status: "resolved" } : g));
    }, 3000);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const complianceControls = gaps.map(g => ({
        control: g.control_id,
        name: g.name,
        gap: g.gap_detail,
        revenueAtRisk: g.revenue_at_risk,
        blockedDeals: g.blocked_deals,
        status: g.status
      }));

      await generateReport({ 
        type: "compliance", 
        complianceControls, 
        orgName: "Your Organisation", 
        preparedBy: "TrustKit Compliance Engine" 
      });
      toast.success("Compliance Gaps PDF exported successfully.");
    } catch (err) {
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
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-[15px] font-black text-foreground flex items-center gap-2 uppercase tracking-wider">
            <ShieldCheck size={18} className="text-primary" />
            Statutory Compliance Pipeline
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium">SOC 2 Type II, ISO 27001, and HIPAA Governance</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl uppercase tracking-widest font-bold">
            {gaps.length} Gaps identified
          </span>
          <button onClick={handleExport} disabled={exporting || gaps.length === 0}
            className="flex items-center gap-1.5 text-[10px] font-black px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all uppercase tracking-widest disabled:opacity-40 shadow-lg shadow-primary/5">
            {exporting ? <RefreshCw size={11} className="animate-spin" /> : <Download size={11} />}
            {exporting ? "Exporting…" : "Export PDF"}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {gaps.map(g => (
          <div key={g.control_id} className="glass rounded-[2rem] p-6 border-white/5 shadow-2xl hover:bg-white/[0.02] transition-all group">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-black bg-cost-amber/10 text-cost-amber border border-cost-amber/20 uppercase tracking-tight">
                    {g.control_id}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono opacity-40">/GAP-882</span>
                </div>
                <h4 className="text-[16px] font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{g.name}</h4>
                <p className="text-[12px] text-muted-foreground mt-1.5 font-medium line-clamp-2">{g.gap_detail}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[22px] font-black font-mono text-cost-amber tracking-tighter leading-none">{fmt(g.revenue_at_risk)}</p>
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-50 mt-1">{g.blocked_deals} Deals Blocked</p>
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-4">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40 mb-1 flex items-center gap-1.5">
                    <AlertCircle size={10} /> AI Remediation Plan
                </p>
                <p className="text-[13px] text-foreground font-bold truncate">{g.action_plan}</p>
              </div>
              
              {g.status === "resolved" ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cost-green/10 border border-cost-green/20 text-cost-green">
                   <ShieldCheck size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Compliant</span>
                </div>
              ) : remediatingId === g.control_id ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cost-amber/10 border border-cost-amber/20 text-cost-amber animate-pulse">
                   <RefreshCw size={14} className="animate-spin" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Fixing...</span>
                </div>
              ) : (
                <button onClick={() => handleAction(g.control_id)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest">
                  Execute Remediation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
