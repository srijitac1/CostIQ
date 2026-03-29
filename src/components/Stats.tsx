const stats = [
  { value: "₹2.4Cr", highlight: false, label: "avg. annual savings per customer" },
  { value: "14 days", highlight: false, label: "average time to first finding" },
  { value: "4 agents", highlight: false, label: "working in parallel, 24/7" },
  { value: "0 dashboards", highlight: false, label: "no reports — we take action" },
];

const Stats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mx-5 md:mx-10">
    {stats.map((s, i) => (
      <div key={i} className="bg-background py-9 px-7 text-center">
        <div className="font-display text-[42px] font-black leading-none">{s.value}</div>
        <div className="text-[13px] text-muted-foreground mt-2">{s.label}</div>
      </div>
    ))}
  </div>
);

export default Stats;
