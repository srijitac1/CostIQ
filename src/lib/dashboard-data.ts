import { calculateAnomalyScore, classifyRisk, getRecommendedAction, RiskLevel } from "./fuzzy-logic";

export interface AnomalyImpact {
  annual_saving: number;
  monthly_saving: number | null;
  formula: string;
  currency: string;
  confidence_pct: number;
}

export interface Anomaly {
  finding_id: string;
  agent: string;
  title: string;
  detail: string;
  risk: RiskLevel;
  impact: AnomalyImpact;
  proposed_action: string;
  action_type: string;
  status: string;
  tab: string;
  score?: number; // Fuzzy score 0-100
}

const RAW_ANOMALIES = [
  { agent: "SaaS", title: "Redundant subscription overhead", detail: "Overlapping Slack, Notion, and Zoom seats across 3 entities.", tab: "anomalies", inputs: { costDeviation: 0.8, vendorRisk: 0.2, timingUnusualness: 0.1, materiality: 0.9, controlRisk: 0.7, benfordVariance: 0.1, riskVelocity: 0.8 } },
  { agent: "Cloud", title: "Infrastructure under-utilisation", detail: "47 EC2 instances averaging below 8% CPU utilization for 30 days.", tab: "resources", inputs: { costDeviation: 0.9, vendorRisk: 0.1, timingUnusualness: 0.1, materiality: 0.8, controlRisk: 0.3, benfordVariance: 0.0, riskVelocity: 0.4 } },
  { agent: "Contract", title: "SLA breach risk — Ticket TK-8821", detail: "Probability of breach >85% due to Tier 2 backlog escalation.", tab: "sla", inputs: { costDeviation: 0.2, vendorRisk: 0.1, timingUnusualness: 0.9, materiality: 0.6, controlRisk: 0.8, benfordVariance: 0.0, riskVelocity: 0.9 } },
  { agent: "Billing", title: "Invoice reconciliation discrepancy", detail: "INV-2024-0891 lacks matching Purchase Order in ERP systems.", tab: "finops", inputs: { costDeviation: 0.7, vendorRisk: 0.6, timingUnusualness: 0.8, materiality: 0.8, controlRisk: 0.9, benfordVariance: 0.4, riskVelocity: 0.2 } },
  { agent: "SaaS", title: "Inactive Adobe CC licenses", detail: "5 Enterprise seats (₹1.5L/yr) have 0 active logins for 140+ days.", tab: "anomalies", inputs: { costDeviation: 0.3, vendorRisk: 0.1, timingUnusualness: 0.2, materiality: 0.4, controlRisk: 0.2, benfordVariance: 0.0, riskVelocity: 0.1 } },
  { agent: "Cloud", title: "Misaligned RDS production tier", detail: "Dev/Test databases running on high-cost Production instances.", tab: "resources", inputs: { costDeviation: 0.6, vendorRisk: 0.1, timingUnusualness: 0.1, materiality: 0.7, controlRisk: 0.4, benfordVariance: 0.0, riskVelocity: 0.3 } },
  { agent: "Billing", title: "Duplicate vendor remittance", detail: "INV-2024-0445 and INV-2024-0451 share identical metadata.", tab: "finops", inputs: { costDeviation: 0.85, vendorRisk: 0.4, timingUnusualness: 0.95, materiality: 0.9, controlRisk: 0.8, benfordVariance: 0.9, riskVelocity: 0.2 } },
  { agent: "Contract", title: "Resolution velocity degradation", detail: "Response times increased by 34% this week; 12 contracts affected.", tab: "sla", inputs: { costDeviation: 0.1, vendorRisk: 0.1, timingUnusualness: 0.8, materiality: 0.5, controlRisk: 0.6, benfordVariance: 0.1, riskVelocity: 0.7 } },
];

export const ALL_ANOMALIES: Anomaly[] = RAW_ANOMALIES.map((raw, idx) => {
  const score = calculateAnomalyScore(raw.inputs);
  const risk = classifyRisk(score);
  
  return {
    finding_id: `AF-${idx + 100}`,
    agent: raw.agent,
    title: raw.title,
    detail: raw.detail,
    risk: risk,
    score: score,
    impact: {
      annual_saving: Math.round(score * 125000 * (raw.inputs.costDeviation + 0.5)),
      monthly_saving: Math.round((score * 125000 * (raw.inputs.costDeviation + 0.5)) / 12),
      formula: `Confidence Score ${score}% × Estimated Variance`,
      currency: "INR",
      confidence_pct: score
    },
    proposed_action: getRecommendedAction(risk),
    action_type: risk === "critical" || risk === "high" ? "api_call" : "notification",
    status: risk === "critical" ? "auto_remediated" : "pending",
    tab: raw.tab
  };
});

export const ALL_SCHEMES = [
  { id: "S1", name: "GST Input Tax Credit Optimizer", description: "Automated reconciliation of GSTR-2A vs Purchase Register for ITC maximization.", impact: "₹4.5L Avg Monthly Saving", status: "Active", type: "Tax" },
  { id: "S2", name: "MSME UDYAM Statutory Benefits", description: "Priority sector lending and interest subvention for registered entities.", impact: "1.5% Subvention", status: "Eligible", type: "Govt" },
  { id: "S3", name: "PLI Governance Framework", description: "Performance Linked Incentive compliance for IT hardware manufacturing.", impact: "6% Incentive Pool", status: "Review", type: "Statutory" },
  { id: "S4", name: "GST Compliance Engine", description: "Autonomous tracking of GSTR-1 and GSTR-3B filing lifecycles.", impact: "Zero Penalty Assurance", status: "On-Track", type: "Compliance" },
];

export const ALL_COMPLIANCE = [
  { id:"CG1", control:"CC6", name:"Logical access controls", gap:"No access review in 180+ days", revenueAtRisk:16600000, blockedDeals:3, blocked_companies:["Mahindra Fintech","HDFC Securities","Bajaj Insurance"], action:"Run automated access review + generate evidence", days:3, status:"pending" },
  { id:"CG2", control:"CC8", name:"Change management", gap:"No formal change approval process documented", revenueAtRisk:9960000, blockedDeals:2, blocked_companies:["Wipro Technologies","Reliance Retail"], action:"Generate change management policy + integrate Linear", days:5, status:"pending" },
  { id:"CG3", control:"CC7", name:"System operations", gap:"No incident response policy exists", revenueAtRisk:6640000, blockedDeals:1, blocked_companies:["Tata Consultancy"], action:"AI-generate IR policy + setup PagerDuty alerting", days:2, status:"pending" },
];

export const INTEGRATIONS_LIST = [
  { id:"aws", name:"AWS", category:"Cloud", connected:false, icon:"▲", col:"#FF9900", controls:["CC6","CC7"], desc:"Cost Explorer, EC2, RDS, S3" },
  { id:"gcp", name:"Google Cloud", category:"Cloud", connected:false, icon:"◆", col:"#4285F4", controls:["CC7"], desc:"Billing, Compute Engine" },
  { id:"github", name:"GitHub", category:"Dev", connected:true, icon:"●", col:"#C8D1DA", controls:["CC8","CC6"], desc:"Repos, PRs, Actions" },
  { id:"jira", name:"Jira / Linear", category:"Dev", connected:false, icon:"◈", col:"#0052CC", controls:["CC8"], desc:"Tickets, sprints, SLA" },
  { id:"google", name:"Google Workspace", category:"Identity", connected:true, icon:"◉", col:"#4285F4", controls:["CC6","CC2"], desc:"Users, groups, audit log" },
  { id:"slack", name:"Slack", category:"Comms", connected:true, icon:"◆", col:"#E01E5A", controls:["CC2"], desc:"Channels, approvals, alerts" },
  { id:"rippling", name:"Rippling", category:"HR", connected:false, icon:"◑", col:"#FF4F00", controls:["CC1","CC6"], desc:"Employees, access, offboarding" },
  { id:"stripe", name:"Stripe", category:"Finance", connected:false, icon:"◐", col:"#635BFF", controls:[], desc:"Payments, subscriptions, invoices" },
  { id:"netsuite", name:"NetSuite / Tally", category:"Finance", connected:false, icon:"◧", col:"#007BC1", controls:[], desc:"GL, invoices, PO matching" },
  { id:"datadog", name:"Datadog", category:"Monitoring", connected:true, icon:"◪", col:"#632CA6", controls:["CC7"], desc:"Metrics, alerts, SLA tracking" },
];

export function fmt(n: number | null | undefined, currency = "INR") {
  if (!n && n !== 0) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}
