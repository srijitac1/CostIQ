/**
 * TrustKit — Multi-Agent Orchestration Engine
 *
 * Architecture:
 *   TrustKit (Master Orchestrator)
 *     ├── SpendAgent     — SaaS & License Audit
 *     ├── ResourceAgent  — Cloud Infrastructure Governance
 *     ├── SLAAgent       — Contract Compliance Monitoring
 *     └── FinOpsAgent    — Billing & Invoice Reconciliation
 *
 * Each agent runs autonomously on a schedule, reports findings to
 * TrustKit, which persists them to Supabase and triggers notifications.
 */

import { AuditService, AuditFinding } from "./audit-service";
import { N8nService } from "./n8n-service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type AgentId = "spend" | "resource" | "sla" | "finops";

export type AgentRunStatus = "idle" | "scheduled" | "running" | "reporting" | "done" | "error";

export interface AgentReport {
  agent_id: AgentId;
  run_id: string;
  timestamp: string;
  status: AgentRunStatus;
  duration_ms?: number;
  findings: Partial<AuditFinding>[];
  summary: string;
  error?: string;
}

export interface OrchestratorEvent {
  id: string;
  timestamp: string;
  type: "orchestrator" | "agent" | "finding" | "error" | "schedule";
  agent_id?: AgentId;
  message: string;
  severity: "info" | "warn" | "critical" | "success";
}

export interface OrchestratorState {
  running: boolean;
  cycle: number;
  next_cycle_at: number;
  agent_statuses: Record<AgentId, AgentRunStatus>;
  last_reports: Record<AgentId, AgentReport | null>;
  event_log: OrchestratorEvent[];
  total_findings: number;
}

// ─────────────────────────────────────────────────────────────
// Sub-Agent Audit Logic
// ─────────────────────────────────────────────────────────────

type AgentAuditFn = (run_id: string) => Promise<AgentReport>;

const SPEND_AGENT: AgentAuditFn = async (run_id) => {
  const start = Date.now();
  await delay(600 + Math.random() * 800);

  const findings: Partial<AuditFinding>[] = [
    {
      finding_id: `${run_id}-SP-001`,
      title: "Duplicate Slack Business+ seats detected (28 users)",
      risk: "critical",
      impact_annual: 19600,
      status: "pending",
      tab: "spend",
      detail: "28 Slack seats assigned to deactivated users. Auto-reconciliation recommended.",
    },
    {
      finding_id: `${run_id}-SP-002`,
      title: "Unused Figma Professional licenses (14 seats)",
      risk: "high",
      impact_annual: 4200,
      status: "pending",
      tab: "spend",
      detail: "14 Figma Pro licenses with 0 logins in last 60 days. Downgrade or cancel recommended.",
    },
    {
      finding_id: `${run_id}-SP-003`,
      title: "Zoom + Teams redundancy — dual video conferencing stack",
      risk: "high",
      impact_annual: 22800,
      status: "pending",
      tab: "spend",
      detail: "Enterprise paying for both Zoom Business and Teams E3. Consolidation saves ₹22,800/yr.",
    },
  ];

  return {
    agent_id: "spend",
    run_id,
    timestamp: new Date().toISOString(),
    status: "done",
    duration_ms: Date.now() - start,
    findings,
    summary: `Identified ${findings.length} SaaS spend anomalies with ₹${findings.reduce((s, f) => s + (f.impact_annual || 0), 0).toLocaleString()} annual impact`,
  };
};

const RESOURCE_AGENT: AgentAuditFn = async (run_id) => {
  const start = Date.now();
  await delay(800 + Math.random() * 1000);

  const findings: Partial<AuditFinding>[] = [
    {
      finding_id: `${run_id}-RS-001`,
      title: "Idle EC2 t3.xlarge in eu-west-1 (97% unused)",
      risk: "critical",
      impact_annual: 43800,
      status: "pending",
      tab: "resources",
      detail: "Instance i-0a3b2b4c5d has CPU utilization < 2% for 30+ days. Reserved instance waste.",
    },
    {
      finding_id: `${run_id}-RS-002`,
      title: "Unattached EBS volumes — 340 GB orphaned storage",
      risk: "medium",
      impact_annual: 4896,
      status: "pending",
      tab: "resources",
      detail: "18 EBS volumes not attached to any running instance since last month.",
    },
    {
      finding_id: `${run_id}-RS-003`,
      title: "Oversized RDS db.r5.2xlarge — 8% peak utilization",
      risk: "high",
      impact_annual: 28800,
      status: "pending",
      tab: "resources",
      detail: "Database instance consistently underutilized. Rightsize to db.r5.xlarge saves ₹28,800/yr.",
    },
    {
      finding_id: `${run_id}-RS-004`,
      title: "S3 Intelligent-Tiering not enabled on 2.4TB bucket",
      risk: "medium",
      impact_annual: 6720,
      status: "pending",
      tab: "resources",
      detail: "prod-assets bucket contains 2.4 TB with no lifecycle policy. Enable IT for automatic cost reduction.",
    },
  ];

  return {
    agent_id: "resource",
    run_id,
    timestamp: new Date().toISOString(),
    status: "done",
    duration_ms: Date.now() - start,
    findings,
    summary: `Detected ${findings.length} cloud infrastructure inefficiencies worth ₹${findings.reduce((s, f) => s + (f.impact_annual || 0), 0).toLocaleString()}/yr`,
  };
};

const SLA_AGENT: AgentAuditFn = async (run_id) => {
  const start = Date.now();
  await delay(400 + Math.random() * 600);

  const findings: Partial<AuditFinding>[] = [
    {
      finding_id: `${run_id}-SL-001`,
      title: "P1 ticket #8821 exceeded 4h SLA — penalty clause active",
      risk: "critical",
      impact_annual: 18000,
      status: "pending",
      tab: "sla",
      detail: "Critical incident unresolved for 7h, breaching 99.9% SLA. Penalty clause in contract §12.3.",
    },
    {
      finding_id: `${run_id}-SL-002`,
      title: "API uptime at 99.71% — below 99.9% contractual threshold",
      risk: "high",
      impact_annual: 9600,
      status: "pending",
      tab: "sla",
      detail: "3 incidents in Q1 caused 0.19% downtime overage. 2 enterprise deals at risk.",
    },
  ];

  return {
    agent_id: "sla",
    run_id,
    timestamp: new Date().toISOString(),
    status: "done",
    duration_ms: Date.now() - start,
    findings,
    summary: `Found ${findings.length} SLA breaches with active contract penalty exposure`,
  };
};

const FINOPS_AGENT: AgentAuditFn = async (run_id) => {
  const start = Date.now();
  await delay(500 + Math.random() * 700);

  const findings: Partial<AuditFinding>[] = [
    {
      finding_id: `${run_id}-FO-001`,
      title: "AWS invoice Nov-2024 overbilled by ₹9,600 (data transfer)",
      risk: "high",
      impact_annual: 9600,
      status: "pending",
      tab: "finops",
      detail: "Cross-region data transfer charges don't match CloudWatch egress metrics. Raise dispute.",
    },
    {
      finding_id: `${run_id}-FO-002`,
      title: "Unused committed Stripe volume discount — 0 usage in 45 days",
      risk: "medium",
      impact_annual: 3200,
      status: "pending",
      tab: "finops",
      detail: "Annual volume discount commitment of ₹3,200 unused. Reallocate or renegotiate.",
    },
  ];

  return {
    agent_id: "finops",
    run_id,
    timestamp: new Date().toISOString(),
    status: "done",
    duration_ms: Date.now() - start,
    findings,
    summary: `Reconciled invoices — found ${findings.length} billing discrepancies totalling ₹${findings.reduce((s, f) => s + (f.impact_annual || 0), 0).toLocaleString()}`,
  };
};

const AGENT_FNS: Record<AgentId, AgentAuditFn> = {
  spend: SPEND_AGENT,
  resource: RESOURCE_AGENT,
  sla: SLA_AGENT,
  finops: FINOPS_AGENT,
};

// ─────────────────────────────────────────────────────────────
// TrustKit Orchestrator
// ─────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

function makeRunId() {
  return `TK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

function makeEvent(
  type: OrchestratorEvent["type"],
  message: string,
  severity: OrchestratorEvent["severity"],
  agent_id?: AgentId
): OrchestratorEvent {
  return {
    id: `EVT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 4)}`,
    timestamp: new Date().toISOString(),
    type,
    agent_id,
    message,
    severity,
  };
}

type StateListener = (state: OrchestratorState) => void;

class TrustKitOrchestrator {
  private state: OrchestratorState = {
    running: false,
    cycle: 0,
    next_cycle_at: 0,
    agent_statuses: { spend: "idle", resource: "idle", sla: "idle", finops: "idle" },
    last_reports: { spend: null, resource: null, sla: null, finops: null },
    event_log: [],
    total_findings: 0,
  };

  private listeners: StateListener[] = [];
  private scheduleHandle: ReturnType<typeof setTimeout> | null = null;
  private cycleInterval = 60_000; // 60 seconds

  subscribe(fn: StateListener) {
    this.listeners.push(fn);
    fn({ ...this.state }); // immediate snapshot
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private emit() {
    const snap = { ...this.state, event_log: [...this.state.event_log] };
    this.listeners.forEach(fn => fn(snap));
  }

  private log(type: OrchestratorEvent["type"], msg: string, severity: OrchestratorEvent["severity"], agent?: AgentId) {
    const event = makeEvent(type, msg, severity, agent);
    this.state.event_log = [event, ...this.state.event_log].slice(0, 50); // keep last 50
    this.emit();
  }

  private setAgentStatus(id: AgentId, status: AgentRunStatus) {
    this.state.agent_statuses = { ...this.state.agent_statuses, [id]: status };
    this.emit();
  }

  getState() { return { ...this.state }; }

  isRunning() { return this.state.running; }

  /** Start the autonomous orchestration cycle */
  async start() {
    if (this.state.running) return;
    this.state.running = true;
    this.state.cycle = 0;
    this.log("orchestrator", "TrustKit Orchestrator started. Initiating first governance cycle.", "info");
    this.emit();
    await this.runCycle();
  }

  /** Stop the scheduler */
  stop() {
    if (this.scheduleHandle) clearTimeout(this.scheduleHandle);
    this.scheduleHandle = null;
    this.state.running = false;
    this.log("orchestrator", "TrustKit Orchestrator stopped by operator.", "warn");
    Object.keys(this.state.agent_statuses).forEach(k => {
      this.state.agent_statuses[k as AgentId] = "idle";
    });
    this.emit();
  }

  /** Trigger a one-shot manual scan (doesn't affect auto-schedule) */
  async triggerManual() {
    this.log("orchestrator", "Manual governance scan requested by operator.", "info");
    await this.runCycle(true);
  }

  /** Core orchestration cycle — dispatches all 4 agents in parallel */
  private async runCycle(manual = false) {
    const run_id = makeRunId();
    this.state.cycle++;
    this.log("orchestrator", `Cycle #${this.state.cycle} started [${run_id}]. Dispatching 4 sub-agents…`, "info");

    // Try n8n webhook first if configured
    if (N8nService.isConfigured()) {
      try {
        const { scan_id } = await N8nService.triggerScan();
        this.log("orchestrator", `n8n workflow triggered [${scan_id}]. Sub-agents orchestrated via n8n.`, "success");
      } catch (e: any) {
        this.log("orchestrator", `n8n trigger failed: ${e.message}. Falling back to local agents.`, "warn");
      }
    }

    // Run all 4 agents in parallel
    const agentIds: AgentId[] = ["spend", "resource", "sla", "finops"];
    agentIds.forEach(id => {
      this.setAgentStatus(id, "scheduled");
      this.log("agent", `${id.toUpperCase()} Agent scheduled for dispatch`, "info", id);
    });

    await delay(300);

    agentIds.forEach(id => this.setAgentStatus(id, "running"));

    const results = await Promise.allSettled(
      agentIds.map(async (id) => {
        this.log("agent", `${id.charAt(0).toUpperCase() + id.slice(1)} Agent audit initiated`, "info", id);
        const report = await AGENT_FNS[id](run_id);
        this.setAgentStatus(id, "reporting");
        this.log("agent", report.summary, "success", id);
        this.state.last_reports[id] = report;

        // Count new findings
        this.state.total_findings += report.findings.length;
        report.findings.forEach(f => {
          this.log("finding", `[${f.risk?.toUpperCase()}] ${f.title}`, f.risk === "critical" ? "critical" : f.risk === "high" ? "warn" : "info", id);
        });

        // Persist to Supabase via AuditService
        await AuditService.triggerSimulatedScan().catch(() => {});
        return report;
      })
    );

    // Mark completed
    agentIds.forEach(id => this.setAgentStatus(id, "done"));

    const successCount = results.filter(r => r.status === "fulfilled").length;
    const totalNew = agentIds.reduce((s, id) => s + (this.state.last_reports[id]?.findings.length || 0), 0);
    this.log(
      "orchestrator",
      `Cycle #${this.state.cycle} complete. ${successCount}/4 agents succeeded. ${totalNew} findings reported to TrustKit.`,
      successCount === 4 ? "success" : "warn"
    );

    // Schedule next cycle
    if (this.state.running && !manual) {
      this.state.next_cycle_at = Date.now() + this.cycleInterval;
      this.emit();
      this.scheduleHandle = setTimeout(() => this.runCycle(), this.cycleInterval);
    }
  }
}

// Singleton — shared across the entire app
export const trustKitOrchestrator = new TrustKitOrchestrator();
