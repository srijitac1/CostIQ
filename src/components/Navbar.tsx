const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border h-[60px] flex items-center justify-between px-5 md:px-10">
    <div className="flex items-baseline gap-0.5">
      <span className="font-display text-[22px] font-black text-primary">Cost</span>
      <span className="font-display text-[22px] font-bold text-foreground">IQ</span>
      <span className="text-[13px] text-muted-foreground font-mono ml-0.5">.ai</span>
    </div>
    <div className="hidden md:flex items-center gap-8">
      <a href="#agents" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Agents</a>
      <a href="#how-it-works" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">How it works</a>
      <a href="#pricing" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
      <a href="/login" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Sign in</a>
      <a href="/login" className="bg-primary text-primary-foreground px-5 py-2 rounded-sm text-[13px] font-semibold hover:brightness-110 transition-all">
        Start free trial
      </a>
    </div>
  </nav>
);

export default Navbar;
