const items = [
  { label: "Spend agent • ₹7L/mo saved • duplicate SaaS detected" },
  { label: "Compliance agent • ₹2Cr unblocked • SOC 2 gap fixed in 3 days" },
  { label: "Resource agent • ₹12L/mo • 47 EC2 instances rightsized" },
  { label: "SLA agent • ₹15L penalty avoided • breach predicted 4h early" },
  { label: "FinOps agent • ₹31L recovered • duplicate invoices caught" },
];

const Ticker = () => (
  <div className="bg-cost-dim border-y border-border py-3 overflow-hidden whitespace-nowrap">
    <div className="inline-flex gap-16 animate-ticker">
      {[...items, ...items].map((item, i) => (
        <span key={i} className="text-xs text-muted-foreground font-mono flex items-center gap-3">
          {item.label}
          <span className="text-cost-green font-medium">▮</span>
        </span>
      ))}
    </div>
  </div>
);

export default Ticker;
