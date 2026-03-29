const plans = [
  {
    tier: "Starter",
    price: "₹14,999",
    period: "per month · billed annually",
    features: ["Spend Intelligence Agent", "Up to 10 integrations", "5 team members", "Email approval workflow", "Monthly savings report", "Email support"],
    cta: "Join waitlist",
    featured: false,
  },
  {
    tier: "Growth",
    price: "₹34,999",
    period: "per month · billed annually",
    features: ["All 4 agents active", "Unlimited integrations", "25 team members", "Slack + email approvals", "Real-time agent dashboard", "TrustKit compliance module", "CSV + PDF export", "Priority support"],
    cta: "Join waitlist",
    featured: true,
  },
  {
    tier: "Enterprise",
    price: "Custom",
    period: "annual contract",
    features: ["Everything in Growth", "Multi-tenant deployment", "Custom agent development", "SSO + SAML", "SLA guarantee", "Dedicated success manager", "On-premise option"],
    cta: "Contact sales",
    featured: false,
  },
];

const Pricing = () => {
  const scrollToWaitlist = () => {
    document.querySelector('#waitlist-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-20 px-5 md:px-10 max-w-[1100px] mx-auto">
      <p className="text-[11px] text-primary font-semibold tracking-widest uppercase font-mono mb-3">Pricing</p>
      <h2 className="font-display text-[clamp(28px,4vw,42px)] font-bold leading-tight mb-4">
        Priced for startups.<br />Built for enterprise.
      </h2>
      <p className="text-base text-muted-foreground max-w-[520px] leading-relaxed mb-14">
        10x cheaper than hiring a FinOps consultant. Pays for itself in the first finding.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <div key={i} className={`bg-cost-surface border rounded p-8 relative ${p.featured ? 'border-primary' : 'border-border'}`}>
            {p.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase whitespace-nowrap">
                Most popular
              </span>
            )}
            <p className="text-xs text-muted-foreground font-medium font-mono tracking-wider uppercase mb-3">{p.tier}</p>
            <div className="font-display text-[42px] font-black mb-1">{p.price}</div>
            <p className="text-[13px] text-muted-foreground mb-6">{p.period}</p>
            <ul className="flex flex-col gap-2.5 mb-7">
              {p.features.map((f, j) => (
                <li key={j} className="text-[13px] text-muted-foreground flex items-start gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-cost-green/15 border border-cost-green/30 flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="hsl(var(--cost-green))" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={scrollToWaitlist}
              className={`block w-full py-3 rounded-sm text-sm font-semibold text-center transition-all active:scale-[0.97] ${
                p.featured
                  ? 'bg-primary text-primary-foreground hover:brightness-110'
                  : 'bg-transparent text-foreground border border-border hover:border-muted-foreground'
              }`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
