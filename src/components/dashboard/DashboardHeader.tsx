import { User } from "@supabase/supabase-js";
import { LogOut, Bell, Download, RefreshCw, FileText, ChevronDown } from "lucide-react";
import { useState } from "react";
import { AuditService } from "@/services/audit-service";
import { ALL_COMPLIANCE } from "@/lib/dashboard-data";
import { generateReport, ReportType } from "@/services/report-service";
import { toast } from "sonner";

interface Props {
  user: User | null;
  signOut: () => Promise<void>;
  activeTab: string;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: "TrustKit — Overview",
  anomalies: "Audit Findings",
  compliance: "Compliance Hub",
  resources: "Cloud Governance",
  sla: "SLA Monitoring",
  finops: "Billing Audit",
  ledger: "Ledger",
  schemes: "Govt Incentives",
  documents: "Documents",
  reports: "Audit Archive",
  settings: "Settings",
};

const REPORT_TYPES: Array<{ type: ReportType; label: string }> = [
  { type: "full",       label: "Full Governance Report" },
  { type: "executive",  label: "Executive Summary"      },
  { type: "findings",   label: "Audit Findings Only"    },
  { type: "compliance", label: "Compliance Gaps Only"   },
];

export default function DashboardHeader({ user, signOut, activeTab }: Props) {
  const [exporting, setExporting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  async function handleExport(type: ReportType) {
    setDropdownOpen(false);
    setExporting(true);
    try {
      const findings = await AuditService.getFindings();
      // Enable 'upload: true' for backend persistence
      await generateReport({
        type,
        findings,
        complianceControls: ALL_COMPLIANCE,
        orgName: user?.user_metadata?.full_name || user?.email || "Your Organisation",
        preparedBy: "TrustKit Compliance Engine",
        upload: true, 
      });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report archived & downloaded.`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate report.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <header className="h-[70px] glass-header flex items-center justify-between px-8 shrink-0 sticky top-0 z-30">
      <h2 className="text-[17px] font-bold text-foreground tracking-tight">{TAB_TITLES[activeTab] || "Dashboard"}</h2>
      <div className="flex items-center gap-4">

        {/* Export Report */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            disabled={exporting}
            className="flex items-center gap-1.5 text-[10px] font-black px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {exporting ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
            {exporting ? "Archiving…" : "Export"}
            {!exporting && <ChevronDown size={11} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl border border-white/10 overflow-hidden shadow-2xl z-50">
              {REPORT_TYPES.map(r => (
                <button key={r.type} onClick={() => handleExport(r.type)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left">
                  <FileText size={12} className="text-primary flex-shrink-0" />
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-primary">
              {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-[13px] text-muted-foreground hidden md:block max-w-[140px] truncate">
            {user?.user_metadata?.full_name || user?.email}
          </span>
        </div>
        <button onClick={signOut}
          className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
