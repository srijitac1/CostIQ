import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else navigate("/dashboard");
    setLoading(false);
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Verifying reset link…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <Link to="/" className="flex items-baseline gap-0.5 justify-center mb-10">
          <span className="font-display text-[22px] font-black text-primary">Cost</span>
          <span className="font-display text-[22px] font-bold text-foreground">IQ</span>
          <span className="text-[13px] text-muted-foreground font-mono ml-0.5">.ai</span>
        </Link>
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-lg font-semibold text-foreground mb-1">Set new password</h1>
          <p className="text-sm text-muted-foreground mb-6">Choose a strong password for your account</p>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded px-3 py-2 mb-4">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">New password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center text-sm py-2.5 px-4 disabled:opacity-50">
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
