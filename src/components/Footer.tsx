const Footer = () => (
  <footer className="px-5 md:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border">
    <div className="flex items-center gap-6">
      <div className="flex items-baseline gap-0.5">
        <span className="font-display text-[22px] font-black text-primary">Cost</span>
        <span className="font-display text-[22px] font-bold text-foreground">IQ</span>
        <span className="text-[13px] text-muted-foreground font-mono ml-0.5">.ai</span>
      </div>
      <div className="flex gap-6">
        {["Privacy", "Terms", "Security", "Docs", "Blog"].map(link => (
          <a key={link} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link}</a>
        ))}
        <a href="mailto:hello@costiq.ai" className="text-xs text-muted-foreground hover:text-foreground transition-colors">hello@costiq.ai</a>
      </div>
    </div>
    <p className="text-xs text-muted-foreground font-mono">© 2026 CostIQ Technologies Pvt Ltd</p>
  </footer>
);

export default Footer;
