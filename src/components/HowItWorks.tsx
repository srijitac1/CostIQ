const steps = [
  { num: "01", title: "Connect your tools", desc: "OAuth in one click. AWS, GitHub, Google Workspace, Slack, Jira, Rippling, billing systems." },
  { num: "02", title: "Agents scan", desc: "All 4 agents run in parallel, using AI tool-use to detect anomalies across your entire operation." },
  { num: "03", title: "Findings with math", desc: "Every finding shows exact rupee impact, the formula, and confidence score. No vague estimates." },
  { num: "04", title: "You approve", desc: "Tiered approval engine — auto for small actions, Slack for medium, CFO queue for large ones." },
  { num: "05", title: "Action executed", desc: "Agent calls the API, makes the change, logs the saving. You see it in the ledger immediately." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 px-5 md:px-10 max-w-[1100px] mx-auto">
    <p className="text-[11px] text-primary font-semibold tracking-widest uppercase font-mono mb-3">How it works</p>
    <h2 className="font-display text-[clamp(28px,4vw,42px)] font-bold leading-tight mb-4">
      Connect. Detect. Approve. Save.
    </h2>
    <p className="text-base text-muted-foreground max-w-[520px] leading-relaxed mb-14">
      From signup to first saving in under 48 hours. No consultant required.
    </p>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-0">
      {steps.map((s, i) => (
        <div key={i} className="text-center px-4 relative">
          <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center mx-auto mb-4 font-mono text-lg font-medium text-primary">
            {s.num}
          </div>
          <p className="text-[13px] font-semibold text-foreground mb-1.5">{s.title}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
