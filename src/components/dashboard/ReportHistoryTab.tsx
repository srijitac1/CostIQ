import { useState, useEffect } from "react";
import { 
  FileText, Download, Trash2, Calendar, 
  Shield, TrendingUp, RefreshCw, ExternalLink, 
  Search, Filter, HardDrive
} from "lucide-react";
import { ReportHistoryService, GovernanceReport } from "@/services/report-history-service";
import { toast } from "sonner";
import { fmt } from "@/lib/dashboard-data";

export default function ReportHistoryTab() {
  const [reports, setReports] = useState<GovernanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await ReportHistoryService.getReports();
      setReports(data);
    } catch (err) {
      toast.error("Failed to load audit archive.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(report: GovernanceReport) {
    setDownloading(report.id);
    try {
      const url = await ReportHistoryService.getDownloadUrl(report.file_path);
      if (url) {
        window.open(url, "_blank");
        toast.success("Download started.");
      } else {
        toast.error("Cloud document not found. It may have been rotated.");
      }
    } catch (err) {
      toast.error("Failed to retrieve document.");
    } finally {
      setDownloading(null);
    }
  }

  async function handleDelete(report: GovernanceReport) {
    if (!confirm(`Are you sure you want to delete report ${report.filename}? This cannot be undone.`)) return;

    try {
      await ReportHistoryService.deleteReport(report.id, report.file_path);
      setReports(prev => prev.filter(r => r.id !== report.id));
      toast.success("Report deleted from archive.");
    } catch (err) {
      toast.error("Failed to delete report.");
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
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-[17px] font-black text-foreground flex items-center gap-2">
            <HardDrive size={18} className="text-primary" />
            Audit Archive
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Historical governance reports archived for compliance traceability.</p>
        </div>
        <button onClick={loadReports}
          className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="glass rounded-3xl p-20 text-center border-white/5 bg-white/[0.02]">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText size={28} className="text-muted-foreground/40" />
          </div>
          <h4 className="text-[16px] font-black text-foreground mb-2">No Archived Reports</h4>
          <p className="text-[12px] text-muted-foreground max-w-xs mx-auto mb-8">
            Trigger a governance scan and Export the results to start building your audit trail.
          </p>
          <button className="text-[11px] font-black text-primary hover:underline uppercase tracking-widest">
            Learn more about retention policies
          </button>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date & Report Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Findings</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Estimated Savings</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((report) => (
                  <tr key={report.id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-foreground truncate max-w-[240px]">{report.filename}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar size={10} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(report.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-white/5 border border-white/10 text-muted-foreground uppercase tracking-tight">
                        {report.report_type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-primary/60" />
                        <span className="text-[13px] font-bold text-foreground">{report.findings_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-cost-green/60" />
                        <span className="text-[13px] font-bold text-cost-green">{fmt(report.savings_total)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(report)}
                          disabled={downloading === report.id}
                          className="p-2 hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloading === report.id ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          className="p-2 hover:bg-cost-red/10 rounded-xl text-muted-foreground hover:text-cost-red transition-all"
                          title="Delete Report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground font-medium">
              Data retention: <span className="text-foreground">7 years</span> · Storage: <span className="text-primary">Supabase Archive Bucket</span>
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cost-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Encryption Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
