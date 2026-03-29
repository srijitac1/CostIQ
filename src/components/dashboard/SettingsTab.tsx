import { INTEGRATIONS_LIST } from "@/lib/dashboard-data";
import { useState, useEffect } from "react";
import { AuditService } from "@/services/audit-service";
import { StatutoryService } from "@/services/statutory-service";
import { N8nService } from "@/services/n8n-service";
import { toast } from "sonner";
import { RefreshCw, Zap, Workflow, ExternalLink, Check, X } from "lucide-react";

export default function SettingsTab() {
  const [integrations, setIntegrations] = useState(() => {
    const saved = localStorage.getItem("trustkit_integrations");
    return saved ? JSON.parse(saved) : INTEGRATIONS_LIST;
  });
  const [scanning, setScanning] = useState(false);
  const [n8nUrl, setN8nUrl] = useState(() => import.meta.env.VITE_N8N_WEBHOOK_URL || localStorage.getItem("n8n_webhook_url") || "");
  const [n8nKey, setN8nKey] = useState(() => localStorage.getItem("n8n_api_key") || "");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  // Persist n8n config + integrations to localStorage
  useEffect(() => {
    if (n8nUrl) localStorage.setItem("n8n_webhook_url", n8nUrl);
    if (n8nKey) localStorage.setItem("n8n_api_key", n8nKey);
    localStorage.setItem("trustkit_integrations", JSON.stringify(integrations));
  }, [n8nUrl, n8nKey, integrations]);

  function toggleConnect(id: string) {
    setIntegrations(list =>
      list.map(i => i.id === id ? { ...i, connected: !i.connected } : i)
    );
    const item = integrations.find(i => i.id === id);
    if (!item?.connected) {
      toast.success(`${id.toUpperCase()} connected for continuous monitoring.`);
    }
  }

  async function handleRunScan() {
    setScanning(true);
    try {
      // Run all scans in parallel for maximum efficiency
      await Promise.all([
        AuditService.triggerSimulatedScan(),
        StatutoryService.triggerComplianceScan(),
        StatutoryService.triggerIncentiveScan()
      ]);
      toast.success("Global Governance scan complete. Findings, Gaps, and Incentives updated.");
    } catch (err) {
      toast.error("Failed to run full automated scan.");
    } finally {
      setScanning(false);
    }
  }

  async function testN8nConnection() {
    if (!n8nUrl) { toast.error("Enter an n8n webhook URL first."); return; }
    setTestStatus("testing");
    try {
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger_source: "trustkit", type: "connection_test" }),
      });
      if (res.ok || res.status === 404) {
        setTestStatus("ok");
        toast.success("n8n webhook is reachable!");
      } else {
        setTestStatus("fail");
        toast.error(`n8n responded with status ${res.status}`);
      }
    } catch {
      setTestStatus("fail");
      toast.error("Could not reach the n8n webhook. Check the URL.");
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-[17px] font-bold text-foreground tracking-tight">Governance Control Center</h3>
          <p className="text-xs text-muted-foreground">Manage enterprise integrations and trigger manual audit scans.</p>
        </div>
        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
        >
          {scanning ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
          {scanning ? "Scanning..." : "Trigger Global Scan"}
        </button>
      </div>

      {/* n8n Configuration */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Workflow size={18} className="text-primary" />
            </div>
            <div>
              <h4 className="text-[14px] font-black text-foreground">n8n Workflow Orchestration</h4>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">TrustKit Multi-Agent Engine</p>
            </div>
          </div>
          {N8nService.isConfigured() && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cost-green bg-cost-green/10 border border-cost-green/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-cost-green rounded-full animate-pulse"></span>
              Connected
            </span>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Webhook URL</label>
              <input
                type="url"
                value={n8nUrl}
                onChange={e => { setN8nUrl(e.target.value); setTestStatus("idle"); }}
                placeholder="https://your-n8n.app.n8n.cloud/webhook/trustkit-scan"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">API Key (optional)</label>
              <input
                type="password"
                value={n8nKey}
                onChange={e => setN8nKey(e.target.value)}
                placeholder="n8n API key for execution polling"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={testN8nConnection}
              disabled={testStatus === "testing" || !n8nUrl}
              className="flex items-center gap-2 text-[11px] font-black px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              {testStatus === "testing" && <RefreshCw size={12} className="animate-spin" />}
              {testStatus === "ok" && <Check size={12} className="text-cost-green" />}
              {testStatus === "fail" && <X size={12} className="text-cost-amber" />}
              {testStatus === "idle" && <Zap size={12} />}
              Test Connection
            </button>

            <a
              href="/n8n-workflow.json"
              download="trustkit-n8n-workflow.json"
              className="flex items-center gap-2 text-[11px] font-black px-5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all uppercase tracking-widest"
            >
              <ExternalLink size={12} />
              Download n8n Workflow JSON
            </a>
          </div>

          <div className="pt-2 border-t border-white/5 text-[10px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-black">Setup:</strong> Import the workflow JSON into n8n → Activate the workflow → Copy the webhook URL above.{" "}
            TrustKit will call it when "Trigger via n8n" is clicked in the Agent Orchestrator.
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="space-y-3">
        <h4 className="text-[13px] font-black text-muted-foreground uppercase tracking-widest px-2">Data Source Integrations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map(i => (
            <div key={i.id} className="glass rounded-2xl p-6 border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner"
                  style={{ background: i.col + "15", color: i.col, border: `1px solid ${i.col}20` }}>
                  {i.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{i.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate opacity-70 font-medium">{i.desc}</p>
                </div>
              </div>
              <button
                onClick={() => toggleConnect(i.id)}
                className={`text-[11px] font-black px-5 py-2 rounded-xl transition-all uppercase tracking-widest ${
                  i.connected
                    ? "bg-cost-green/10 text-cost-green border border-cost-green/20"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/5"
                }`}
              >
                {i.connected ? "Connected" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

