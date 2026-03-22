const agents = [
  {
    name: "Spend Intelligence Agent",
    color: "border-l-primary text-primary",
    title: "Finds every rupee you're wasting on vendors",
    desc: "Scans SaaS subscriptions, vendor invoices, and procurement data for duplicates, zombie licenses, and rate optimisation opportunities. Generates actionable playbooks with exact savings math.",
    example: "Found: 3x Slack billing across depts\nSaving: ₹7,00,000 / year\nAction: Consolidate → enterprise license",
  },
  {
    name: "Resource Optimisation Agent",
    color: "border-l-cost-amber text-cost-amber",
    title: "Eliminates cloud waste automatically",
    desc: "Monitors AWS, GCP, and Azure utilisation in real time. Identifies underutilised instances, over-provisioned storage, and idle resources. Executes rightsizing after your approval.",
    example: "Found: 47 EC2 at 8% avg CPU\nSaving: ₹12,40,000 / month\nAction: Rightsize via AWS API",
  },
  {
    name: "SLA Prevention Agent",
    color: "border-l-destructive text-destructive",
    title: "Stops penalty clauses before they trigger",
    desc: "Monitors ITSM queues and operational signals in real time. Predicts breach probability per active ticket and reroutes work, shifts resources, or escalates — before the financial hit lands.",
    example: "Detected: TK-8821 at 87% breach risk\nPenalty avoided: ₹15,00,000\nAction: Auto-escalated to Tier 2",
  },
  {
    name: "FinOps Reconciler Agent",
    color: "border-l-cost-blue text-cost-blue",
    title: "Catches invoice fraud and errors instantly",
    desc: "Pulls GL entries, matches against invoices and POs, flags discrepancies with root-cause attribution. Cuts your monthly close from 5 days to under 1. Stops duplicate payments before they clear.",
    example: "Found: INV-2024-0891 no matching PO\nAmount at risk: ₹12,40,000\nAction: Hold + CFO escalation",
  },
];

const AgentsSection = () => (
  <section id="agents" className="py-20 px-5 md:px-10 max-w-[1100px] mx-auto">
    <p className="text-[11px] text-primary font-semibold tracking-widest uppercase font-mono mb-3">The agent fleet</p>
    <h2 className="font-display text-[clamp(28px,4vw,42px)] font-bold leading-tight mb-4">
      Four agents. One mission.<br />Stop the bleeding.
    </h2>
    <p className="text-base text-muted-foreground max-w-[520px] leading-relaxed mb-14">
      Each agent runs continuously, uses AI to detect patterns your team can't see, and triggers corrective actions — with your sign-off.
    </p>
    <div className="grid md:grid-cols-2 gap-4">
      {agents.map((a, i) => (
        <div key={i} className={`bg-cost-surface border border-border rounded p-7 border-l-[3px] ${a.color.split(' ')[0]}`}>
          <p className={`text-xs font-semibold font-mono tracking-wider uppercase mb-2.5 ${a.color.split(' ')[1]}`}>
            {a.name}
          </p>
          <h3 className="text-lg font-semibold text-foreground mb-2">{a.title}</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{a.desc}</p>
          <pre className="bg-cost-dim rounded-sm p-3 font-mono text-[11px] text-cost-green leading-relaxed whitespace-pre-wrap">
            {a.example}
          </pre>
        </div>
      ))}
    </div>
  </section>
);

export default AgentsSection;
