import { supabase } from "@/integrations/supabase/client";
import { calculateAnomalyScore, classifyRisk, getRecommendedAction } from "@/lib/fuzzy-logic";

export interface AuditFinding {
  id?: string;
  finding_id: string;
  title: string;
  detail: string;
  risk: string;
  score: number;
  impact_annual: number;
  status: string;
  tab: string;
  created_at?: string;
  owner?: string;
  due_date?: string;
  remediation_notes?: string;
  verified_at?: string;
}

export const AuditService = {
  async getFindings() {
    try {
      const { data, error } = await (supabase as any)
        .from("audit_findings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        // If table doesn't exist, just return empty findings for now
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          console.warn("audit_findings table not found. Returning empty list.");
          return [];
        }
        throw error;
      }
      return data as AuditFinding[];
    } catch (err) {
      console.warn("Audit findings fetch failed:", err);
      return [];
    }
  },

  async remediateFinding(id: string, status: string) {
    const { error } = await (supabase as any)
      .from("audit_findings")
      .update({ status })
      .eq("finding_id", id);
    
    if (error) throw error;
  },

  async updateFinding(id: string, updates: Partial<AuditFinding>) {
    const { error } = await (supabase as any)
      .from("audit_findings")
      .update(updates)
      .eq("finding_id", id);
    
    if (error) throw error;
  },

  async assignFinding(id: string, owner: string) {
    return this.updateFinding(id, { owner, status: "in_progress" });
  },

  async markVerified(id: string) {
    return this.updateFinding(id, { 
      status: "verified", 
      verified_at: new Date().toISOString() 
    });
  },

  async triggerSimulatedScan() {
    // Generate 3-5 random findings
    const count = Math.floor(Math.random() * 3) + 3;
    const newFindings: AuditFinding[] = [];

    const scenarios = [
      { agent: "SaaS", tabs: ["anomalies"] },
      { agent: "Cloud", tabs: ["resources"] },
      { agent: "Contract", tabs: ["sla"] },
      { agent: "Billing", tabs: ["finops"] }
    ];

    for (let i = 0; i < count; i++) {
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const inputs = {
            costDeviation: Math.random(),
            vendorRisk: Math.random(),
            timingUnusualness: Math.random(),
            materiality: Math.random(),
            controlRisk: Math.random(),
            benfordVariance: Math.random() > 0.8 ? Math.random() : 0.0,
            riskVelocity: Math.random()
        };

        const score = calculateAnomalyScore(inputs);
        const risk = classifyRisk(score);
        const annual_saving = Math.round(score * 150000 * (inputs.materiality + 0.5));

        newFindings.push({
            finding_id: `AF-${Math.floor(Math.random() * 9000) + 1000}`,
            title: `Simulated ${scenario.agent} Governance Alert`,
            detail: `Detected variance in ${scenario.agent} operations with ${Math.round(score)}% confidence.`,
            risk,
            score,
            impact_annual: annual_saving,
            status: risk === "critical" ? "auto_remediated" : "pending",
            tab: scenario.tabs[0],
            owner: Math.random() > 0.7 ? "Governance Team" : undefined,
            due_date: Math.random() > 0.5 ? new Date(Date.now() + 86400000 * 7).toISOString() : undefined
        });
    }

    const { error } = await supabase.from("audit_findings").insert(newFindings);
    if (error) throw error;
    return newFindings;
  },

  async resetFindings() {
    const { error } = await supabase.from("audit_findings").delete().neq("finding_id", "0");
    if (error) throw error;
  }
};
