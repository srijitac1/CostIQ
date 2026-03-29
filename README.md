# CostIQ.ai (TrustKit)

**An Enterprise-Grade Autonomous Governance, Audit, and Compliance Platform**

CostIQ.ai (branded as TrustKit) is a next-generation Software-as-a-Service (SaaS) platform designed to automate and augment traditional financial operations (FinOps), compliance auditing (SOC 2, ISO), and resource governance. By combining multi-agent orchestration with sophisticated fuzzy logic, CostIQ replaces manual consulting hours with continuous, autonomous anomaly detection.

---

##  Innovation & Tech Depth

At the core of CostIQ lies a departure from traditional "threshold-based" alerting (e.g., *alert if spend > $1k*). Instead, the platform utilizes:

1. **Big 4 Audit-Grade Fuzzy Logic Engine:**
   Anomalies are scored dynamically using complex, weighted methodologies derived from top-tier audit firms. The engine evaluates:
   - *Materiality* (Financial significance)
   - *Control Risk* (Weakness of internal mitigations)
   - *Benford's Law Variance* (Statistical evidence of data manipulation)
   - *Risk Velocity* (Rate of issue escalation)

2. **Autonomous Multi-Agent Orchestration:**
   The `AgentOrchestrator` runs entirely autonomously, dispatching specialized agents in parallel:
   - **SpendAgent:** Scans for duplicate or unused SaaS licenses (Slack, Figma).
   - **ResourceAgent:** Identifies idle cloud infrastructure (EC2, unattached EBS).
   - **SLAAgent:** Monitors contract compliance and SLA breaches.
   - **FinOpsAgent:** Reconciles billing and invoice discrepancies.

3. **Context-Aware Generative AI ("Sri"):**
   Powered by Gemini 1.5, the platform features a voice-enabled conversational AI. Unlike generic chatbots, Sri is contextually aware of the user's live dashboard, database findings, and active compliance gaps, providing instant executive summaries and remediation workflows.

---

##  Features Overview

**TrustKit (The Master Orchestrator)**  
TrustKit is the central intelligence engine of the platform. It functions as the Master Orchestrator, managing schedules, aggregating findings, and persisting real-time data to the Supabase backend. TrustKit triggers governance cycles on demand or via N8N webhooks, evaluating the output of four specialized sub-agents.

**The 4 Autonomous Sub-Agents**  
These agents operate in parallel during a TrustKit scan, each designed to tackle a specific domain of enterprise leakage:

1. **Spend Agent (SaaS & License Audit):** 
   Autonomously cross-references user activity logs against active SaaS subscriptions. It flags duplicate licenses, deactivated employee accounts still consuming paid seats, and underutilized professional tiers (e.g., dormant Figma or Slack accounts), instantly calculating the annual revenue that can be saved.
   
2. **Resource Agent (Cloud Governance):** 
   Scans AWS, GCP, and Azure environments. It identifies idle computational instances (e.g., t3.xlarge servers running at 2% CPU for 30 days) and orphaned storage volumes (unattached EBS). The agent recommends rightsizing or termination to prevent massive cloud bill shocks.

3. **SLA Agent (Contract Compliance):** 
   Monitors incident management systems (like Jira/ServiceNow) against contractual Service Level Agreements. If a P1 ticket breaches a 4-hour resolution window causing a 99.9% uptime violation, the SLAAgent identifies the exact penalty clause triggered, allowing teams to proactively manage customer expectations.

4. **FinOps Agent (Invoice Reconciliation):** 
   Performs deep audits on structural billing. It reconciles cloud ingress/egress data transfer charges against CloudWatch metrics or flags unused enterprise volume discounts (e.g., Stripe tiered pricing) that were negotiated but never fully leveraged.

---

##  Tech Stack

- **Frontend & UI:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons. Designed with premium glassmorphism and modern enterprise aesthetics.
- **Backend & Persistence:** Supabase. Utilizes PostgreSQL for robust data integrity (Audit Findings, Compliance Gaps, Statutory Incentives), Row Level Security (RLS) policies, and Supabase Storage for secure enterprise document governance.
- **AI & Orchestration:** Google Gemini REST APIs (Streaming Chat), N8N (External webhook and workflow orchestration).

---

##  Real Business Impact

CostIQ directly impacts the bottom line by transforming compliance from a cost-center into a revenue-saving engine.
- **Immediate ROI:** Automatically detects over-provisioned cloud resources and unused SaaS licenses, instantly calculating potential annual savings.
- **Risk Mitigation:** Continuously monitors SOC 2 / ISO compliance controls (e.g., CC6 Logical Access), flagging "Revenue at Risk" before enterprise deals are blocked.
- **Statutory Optimization:** Proactively matches organizational profiles with unutilized government schemes (e.g., MSME Udyam, ITC optimizers) to maximize external financial incentives.
- **Efficiency:** Turns a 3-month manual audit process into a continuous, real-time dashboard.

---

##  SDLC (Software Development Life Cycle) Overview

The development of CostIQ followed a rapid, iterative agile methodology focused on high-fidelity prototyping and robust architecture:

1. **Discovery & Domain Modeling:** Analyzed standard audit practices, SOC 2 frameworks, and FinOps principles to map the necessary database schema and fuzzy logic weightings.
2. **Core Engine Development (Backend):** Implemented the `fuzzy-logic.ts` mathematical models and the asynchronous `agent-orchestrator` timeline.
3. **Data Layer Integration:** Integrated Supabase for remote persistent storage, ensuring all simulated automated scans were firmly backed by a relational PostgreSQL database.
4. **Generative AI Layer:** Connected the Gemini streaming API, building custom local-fallback simulations to ensure zero downtime during demo phases or missing API keys.
5. **Frontend Polish:** Iterative refinement of the Tailwind/Vite UI to ensure a premium, modern "glassmorphic" SaaS presentation.
6. **Continuous Delivery:** Automated workflow testing via N8N webhooks and isolated component testing.

---

*Built for the future of automated enterprise governance.*
