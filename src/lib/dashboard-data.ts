// Dashboard data constants and utilities

export const TICKER = [
  "Spend agent: ₹7L/mo duplicate SaaS detected across 3 departments",
  "Compliance agent: SOC 2 CC6 gap blocking ₹2Cr in enterprise deals",
  "Resource agent: 47 EC2 instances at 8% avg CPU — ₹12L/mo savings",
  "SLA agent: Ticket TK-8821 breach probability 87% — escalating now",
  "FinOps agent: Invoice INV-2024-0891 — no matching PO found",
  "Spend agent: Adobe CC unused 143 days — cancel saving ₹1.5L/yr",
];

export const ALL_ANOMALIES = [
  { finding_id:"CA1", agent:"Spend", title:"Duplicate SaaS subscriptions", detail:"Slack, Notion, Zoom billed separately across 3 departments.", risk:"high" as const, impact:{ annual_saving:6972000, monthly_saving:581000, formula:"3 depts × ₹48,333/mo × 12", currency:"INR", confidence_pct:92 }, proposed_action:"Consolidate to single enterprise license", action_type:"api_call", status:"pending", tab:"anomalies" },
  { finding_id:"CA2", agent:"Resource", title:"47 EC2 instances at 8% avg CPU", detail:"Consistent underutilisation in ap-south-1 over 30 days.", risk:"high" as const, impact:{ annual_saving:12350400, monthly_saving:1029200, formula:"47 × ₹21,900/mo saving", currency:"INR", confidence_pct:88 }, proposed_action:"Rightsize to next tier via AWS API", action_type:"api_call", status:"pending", tab:"resources" },
  { finding_id:"CA3", agent:"SLA", title:"Ticket TK-8821 — 87% breach probability", detail:"Tier 2 backlog building. SLA window closes in 4h.", risk:"critical" as const, impact:{ annual_saving:1245000, monthly_saving:null, formula:"₹12.45L penalty per breach clause", currency:"INR", confidence_pct:87 }, proposed_action:"Auto-escalate to Tier 2 + reroute tickets", action_type:"workflow", status:"pending", tab:"sla" },
  { finding_id:"CA4", agent:"FinOps", title:"Invoice INV-2024-0891 — discrepancy", detail:"No matching PO found in SAP. Possible duplicate payment.", risk:"high" as const, impact:{ annual_saving:1240000, monthly_saving:null, formula:"₹12.4L unreconciled — 3 similar this quarter", currency:"INR", confidence_pct:94 }, proposed_action:"Flag for CFO review + pause recurring payment", action_type:"notification", status:"pending", tab:"finops" },
  { finding_id:"CA5", agent:"Spend", title:"Adobe CC — 143 days no login", detail:"5 seats paying ₹1.5L/yr, last login 143 days ago.", risk:"medium" as const, impact:{ annual_saving:150000, monthly_saving:12500, formula:"5 seats × ₹2,500/mo × 12", currency:"INR", confidence_pct:99 }, proposed_action:"Cancel subscription — no active users", action_type:"api_call", status:"pending", tab:"anomalies" },
  { finding_id:"CA6", agent:"Resource", title:"3 RDS instances with 2% read load", detail:"Dev databases running in production tier unnecessarily.", risk:"medium" as const, impact:{ annual_saving:2988000, monthly_saving:249000, formula:"3 instances × ₹83,000/mo saving", currency:"INR", confidence_pct:91 }, proposed_action:"Downgrade to db.t3.micro or pause dev DBs", action_type:"api_call", status:"pending", tab:"resources" },
  { finding_id:"CA7", agent:"FinOps", title:"Vendor Twilio — duplicate invoice", detail:"INV-2024-0445 and INV-2024-0451 same amount, 3 days apart.", risk:"high" as const, impact:{ annual_saving:280000, monthly_saving:null, formula:"₹2.8L potential duplicate payment", currency:"INR", confidence_pct:89 }, proposed_action:"Hold INV-2024-0451 pending vendor confirmation", action_type:"notification", status:"pending", tab:"finops" },
  { finding_id:"CA8", agent:"SLA", title:"Ticket queue velocity dropping", detail:"Avg resolution time up 34% this week. 12 tickets at risk.", risk:"high" as const, impact:{ annual_saving:3735000, monthly_saving:null, formula:"Est. ₹3.1L/mo penalty exposure at current rate", currency:"INR", confidence_pct:82 }, proposed_action:"Redistribute load to Agent Pool B", action_type:"workflow", status:"pending", tab:"sla" },
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
