const capabilities = [
  {
    label: "Gap detection",
    desc: "Scans SOC 2 control gaps and maps each one to the enterprise deals it's blocking — with exact revenue at risk.",
  },
  {
    label: "Policy generation",
    desc: "Generates audit-ready policies using AI — incident response, change management, access reviews — in hours, not weeks.",
  },
  {
    label: "Auto access reviews",
    desc: "Runs automated access reviews across Google Workspace, GitHub, and AWS. Produces evidence packages auditors accept.",
  },
  {
    label: "Deal unblocking",
    desc: "Tracks remediation in real time and alerts sales the moment a gap is closed — so deals move the day you're compliant.",
  },
];

const TrustKitSection = () => (
  <section id="trustkit" className="py-20 px-5 md:px-10 max-w-[1100px] mx-auto">
    <div className="mb-14">
      <p className="text-[11px] text-cost-green font-semibold tracking-widest uppercase font-mono mb-3">
        TrustKit — Compliance Intelligence
      </p>
      <h2 className="font-display text-[clamp(28px,4vw,42px)] font-bold leading-tight mb-4">
        Turn SOC 2 gaps into<br />closed deals.
      </h2>
      <p className="text-base text-muted-foreground max-w-[560px] leading-relaxed">
        Most teams lose months and millions waiting for compliance. TrustKit finds every gap blocking revenue, fixes it with AI-generated policies and automated reviews, and tells sales the second the door is open.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-5 mb-8">
      {capabilities.map((c, i) => (
        <div key={i} className="bg-cost-surface border border-border rounded-lg p-6">
          <p className="text-sm font-semibold text-cost-green mb-1.5">{c.label}</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{c.desc}</p>
        </div>
      ))}
    </div>

    {/* Live example card */}
    <div className="bg-cost-dim border border-border rounded-lg p-6 md:p-8">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-4">Live example</p>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <p className="text-[11px] text-muted-foreground font-mono mb-1">Gap found</p>
          <p className="text-sm text-foreground font-medium">CC6 access control — no review in 180 days</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-mono mb-1">Revenue blocked</p>
          <p className="text-sm font-mono font-bold text-cost-amber">$2,00,000 across 3 deals</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-mono mb-1">Resolution</p>
          <p className="text-sm text-cost-green font-medium">Auto-access review → policy → auditor booked in 3 days</p>
        </div>
      </div>
    </div>
  </section>
);

export default TrustKitSection;
