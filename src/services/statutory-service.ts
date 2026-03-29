import { supabase } from "@/integrations/supabase/client";

export interface ComplianceGap {
  id?: string;
  control_id: string;
  name: string;
  gap_detail: string;
  revenue_at_risk: number;
  blocked_deals: number;
  action_plan: string;
  status: "pending" | "resolved";
  created_at?: string;
}

export interface StatutoryIncentive {
  id?: string;
  name: string;
  description: string;
  impact_estimate: string;
  type: string;
  status: "active" | "eligible" | "review" | "on-track";
  created_at?: string;
}

export const StatutoryService = {
  async getComplianceGaps() {
    try {
      const { data, error } = await (supabase as any)
        .from("compliance_gaps")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        if (error.code === "PGRST116" || error.message.includes("does not exist")) return [];
        throw error;
      }
      return data as ComplianceGap[];
    } catch (err) {
      console.warn("Compliance gaps fetch failed:", err);
      return [];
    }
  },

  async getStatutoryIncentives() {
    try {
      const { data, error } = await (supabase as any)
        .from("statutory_incentives")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        if (error.code === "PGRST116" || error.message.includes("does not exist")) return [];
        throw error;
      }
      return data as StatutoryIncentive[];
    } catch (err) {
      console.warn("Statutory incentives fetch failed:", err);
      return [];
    }
  },

  async triggerComplianceScan() {
    // Simulated logic: generate gaps based on common SOC2/ISO findings
    const mockGaps: ComplianceGap[] = [
      { control_id: "CC6", name: "Logical access controls", gap_detail: "No access review in 180+ days", revenue_at_risk: 16600000, blocked_deals: 3, action_plan: "Run automated access review + generate evidence", status: "pending" },
      { control_id: "CC8", name: "Change management", gap_detail: "No formal change approval process documented", revenue_at_risk: 9960000, blocked_deals: 2, action_plan: "Generate change management policy + integrate Linear", status: "pending" }
    ];

    const { error } = await (supabase as any).from("compliance_gaps").insert(mockGaps);
    if (error) console.error("Compliance gap insertion failed:", error);
    return mockGaps;
  },

  async triggerIncentiveScan() {
    const mockIncentives: StatutoryIncentive[] = [
      { name: "GST Input Tax Credit Optimizer", description: "Automated reconciliation for ITC maximization.", impact_estimate: "₹4.5L Avg Monthly Saving", type: "Tax", status: "active" },
      { name: "MSME UDYAM Statutory Benefits", description: "Priority sector lending and interest subvention.", impact_estimate: "1.5% Subvention", type: "Govt", status: "eligible" }
    ];

    const { error } = await (supabase as any).from("statutory_incentives").insert(mockIncentives);
    if (error) console.error("Incentive insertion failed:", error);
    return mockIncentives;
  }
};
