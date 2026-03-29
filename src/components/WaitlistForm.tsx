import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  variant?: "hero" | "banner" | "inline";
  className?: string;
}

export default function WaitlistForm({ variant = "inline", className = "" }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("waitlist").insert({
      email: email.trim().toLowerCase(),
      company_name: company.trim() || null,
    });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already on the waitlist!");
        setDone(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }

    toast.success("You're on the list! We'll be in touch.");
    setDone(true);
  }

  if (done) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-cost-green animate-pulse" />
        <span className="text-sm text-cost-green font-medium">You're on the waitlist — we'll reach out soon.</span>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 max-w-[480px] mx-auto ${className}`}>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="work@company.com"
          className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 py-3.5 rounded-xl whitespace-nowrap disabled:opacity-60 shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
        >
          {loading ? "Joining…" : "Join waitlist →"}
        </button>
      </form>
    );
  }

  if (variant === "banner") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 max-w-[500px] mx-auto ${className}`}>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="work@company.com"
          className="flex-1 bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Company name"
          className="sm:w-[160px] bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary whitespace-nowrap disabled:opacity-60"
        >
          {loading ? "Joining…" : "Request access →"}
        </button>
      </form>
    );
  }

  // inline variant
  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="work@company.com"
        className="flex-1 bg-cost-surface border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-sm whitespace-nowrap disabled:opacity-60"
      >
        {loading ? "…" : "Join →"}
      </button>
    </form>
  );
}
