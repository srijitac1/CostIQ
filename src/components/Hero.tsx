import WaitlistForm from "@/components/WaitlistForm";

const Hero = () => (
  <section className="pt-40 pb-24 px-5 md:px-10 max-w-[900px] mx-auto text-center animate-fade-up">
    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3.5 py-1.5 mb-7">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
      <span className="text-[11px] text-primary font-semibold tracking-wider uppercase font-mono">
        AI agents · Now in private beta
      </span>
    </div>
    <h1 className="font-display text-[clamp(36px,6vw,68px)] font-black leading-[1.05] mb-6 tracking-tight">
      Your enterprise is leaking{' '}
      <span className="text-primary">₹2Cr/year</span>. We find it.
    </h1>
    <p className="text-lg text-muted-foreground max-w-[560px] mx-auto mb-10 leading-relaxed">
      CostIQ deploys autonomous AI agents that continuously monitor your operations, detect cost waste and compliance gaps, and fix them — with your approval.
    </p>
    <WaitlistForm variant="hero" />
    <p className="text-[11px] text-muted-foreground mt-3 font-mono">No credit card required · First finding free</p>
  </section>
);

export default Hero;
