const testimonials = [
  {
    saving: "₹1.2Cr saved",
    quote: "CostIQ found ₹84L/year in duplicate SaaS in 48 hours. We had no idea we were paying for Slack three times.",
    name: "Arjun Mehta",
    role: "CTO, Fintech startup · 60 employees",
  },
  {
    saving: "3 deals closed",
    quote: "The TrustKit module showed us ₹2Cr in blocked deals. We fixed the SOC 2 gaps in 11 days and closed all three.",
    name: "Priya Sharma",
    role: "CEO, B2B SaaS · 15 employees",
  },
  {
    saving: "₹31L recovered",
    quote: "The FinOps agent caught a duplicate vendor payment before it cleared. That alone paid for 2 years of CostIQ.",
    name: "Vikram Nair",
    role: "CFO, E-commerce platform · 200 employees",
  },
];

const Testimonials = () => (
  <section className="py-20 px-5 md:px-10 max-w-[1100px] mx-auto">
    <p className="text-[11px] text-primary font-semibold tracking-widest uppercase font-mono mb-3">Early customers</p>
    <h2 className="font-display text-[clamp(28px,4vw,42px)] font-bold leading-tight mb-14">
      Founders who stopped guessing<br />and started saving.
    </h2>
    <div className="grid md:grid-cols-3 gap-4">
      {testimonials.map((t, i) => (
        <div key={i} className="bg-cost-surface border border-border rounded p-7">
          <p className="font-mono text-xl font-medium text-cost-green mb-2">{t.saving}</p>
          <p className="text-sm text-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground not-italic block mb-0.5">{t.name}</strong>
            {t.role}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
