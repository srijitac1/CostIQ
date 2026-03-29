import WaitlistForm from "@/components/WaitlistForm";

const Hero = () => (
  <section className="pt-40 pb-24 px-5 md:px-10 max-w-[900px] mx-auto text-center animate-fade-up">
    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 mb-8 shadow-xl">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(235,0,24,0.6)]" />
      <span className="text-[10px] text-foreground font-black tracking-[0.2em] uppercase font-mono">
        Audit-Ready · Continuous Compliance
      </span>
    </div>
    <h1 className="font-display text-[clamp(40px,7vw,72px)] font-black leading-[1.02] mb-8 tracking-tighter">
      Automated Governance for <br />
      <span className="text-primary text-glow">Enterprise Cost & Compliance</span>.
    </h1>
    <p className="text-lg text-muted-foreground max-w-[600px] mx-auto mb-10 leading-relaxed font-medium">
      CostIQ provides continuous monitoring and autonomous remediation for cloud infrastructure and SaaS operations. Ensure audit-readiness and eliminate operational waste with AI-driven governance.
    </p>
    <WaitlistForm variant="hero" />
    <p className="text-[11px] text-muted-foreground mt-3 font-mono">Enterprise-grade security · SOC 2 compliant architecture</p>
  </section>
);

export default Hero;
