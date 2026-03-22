import WaitlistForm from "@/components/WaitlistForm";

const CtaBanner = () => (
  <section id="waitlist-cta" className="bg-cost-surface border-y border-border py-20 px-5 md:px-10 text-center">
    <h2 className="font-display text-[42px] font-bold mb-4">Stop the leak. Start today.</h2>
    <p className="text-base text-muted-foreground max-w-[480px] mx-auto mb-8 leading-relaxed">
      Join the waitlist for early access. Most customers see ROI within 48 hours of connecting their first integration.
    </p>
    <WaitlistForm variant="banner" />
  </section>
);

export default CtaBanner;
