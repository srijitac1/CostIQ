/**
 * n8n Service — TrustKit Multi-Agent Orchestration
 *
 * Integrates with n8n workflows via webhooks. TrustKit acts as the
 * master orchestrator, triggering sub-agent workflows in n8n.
 *
 * Setup:
 *   VITE_N8N_WEBHOOK_URL = https://your-n8n.app.n8n.cloud/webhook/trustkit-scan
 *   VITE_N8N_API_KEY     = your_n8n_api_key (optional, for REST API polling)
 *   VITE_N8N_INSTANCE_URL = https://your-n8n.app.n8n.cloud (for status polling)
 */

export interface N8nScanPayload {
  trigger_source: "trustkit";
  organization_id: string;
  agents: Array<"spend" | "resource" | "sla" | "finops">;
  scan_id: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface N8nExecutionStatus {
  id: string;
  status: "new" | "running" | "success" | "error" | "waiting";
  startedAt?: string;
  stoppedAt?: string;
  data?: Record<string, unknown>;
}

export interface AgentScanResult {
  agent_id: string;
  status: "queued" | "running" | "done" | "error";
  findings_count: number;
  execution_id?: string;
  error?: string;
}

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY as string | undefined;
const N8N_INSTANCE_URL = import.meta.env.VITE_N8N_INSTANCE_URL as string | undefined;

function generateScanId() {
  return `TK-${Date.now().toString(36).toUpperCase()}`;
}

export const N8nService = {

  isConfigured(): boolean {
    return !!N8N_WEBHOOK_URL;
  },

  /**
   * Trigger a full TrustKit governance scan via n8n webhook.
   * n8n will orchestrate the 4 sub-agent workflows and push results
   * back to Supabase via the result webhook.
   */
  async triggerScan(
    agents: Array<"spend" | "resource" | "sla" | "finops"> = ["spend", "resource", "sla", "finops"],
    orgId = "default-org"
  ): Promise<{ scan_id: string; execution_id?: string }> {
    const scan_id = generateScanId();

    const payload: N8nScanPayload = {
      trigger_source: "trustkit",
      organization_id: orgId,
      agents,
      scan_id,
      timestamp: new Date().toISOString(),
      context: {
        initiated_by: "dashboard",
        orchestrator: "TrustKit v1.2",
      },
    };

    if (!N8N_WEBHOOK_URL) {
      console.warn("[n8n] No webhook URL configured. Running simulation.");
      return { scan_id };
    }

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(N8N_API_KEY ? { "X-N8N-API-KEY": N8N_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`n8n webhook failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json().catch(() => ({}));
    return { scan_id, execution_id: data?.executionId };
  },

  /**
   * Poll n8n REST API for execution status.
   * Requires VITE_N8N_API_KEY and VITE_N8N_INSTANCE_URL.
   */
  async getExecutionStatus(executionId: string): Promise<N8nExecutionStatus | null> {
    if (!N8N_INSTANCE_URL || !N8N_API_KEY) return null;

    try {
      const res = await fetch(`${N8N_INSTANCE_URL}/api/v1/executions/${executionId}`, {
        headers: { "X-N8N-API-KEY": N8N_API_KEY },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Simulate agent scan results locally (used when n8n is not configured).
   * Mimics the timing of real n8n workflow execution.
   */
  async simulateScan(
    agents: string[],
    onProgress: (agentId: string, result: AgentScanResult) => void
  ): Promise<void> {
    const scan_id = generateScanId();

    // Mark all agents as queued
    for (const agentId of agents) {
      onProgress(agentId, { agent_id: agentId, status: "queued", findings_count: 0 });
    }

    // Simulate each agent running with staggered timing
    const delays = [800, 1400, 2200, 3000];
    const mockFindings: Record<string, number> = {
      spend: 3, resource: 7, sla: 2, finops: 1,
    };

    for (let i = 0; i < agents.length; i++) {
      const agentId = agents[i];
      await new Promise(r => setTimeout(r, delays[0]));

      onProgress(agentId, { agent_id: agentId, status: "running", findings_count: 0, execution_id: `SIM-${scan_id}-${i}` });

      await new Promise(r => setTimeout(r, delays[i] ?? 1000));

      onProgress(agentId, {
        agent_id: agentId,
        status: "done",
        findings_count: mockFindings[agentId] ?? 1,
        execution_id: `SIM-${scan_id}-${i}`,
      });
    }
  },
};
