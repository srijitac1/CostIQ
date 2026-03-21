import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (session) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, company_name: companyName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) { setError(error.message); }
      else { setMessage("Check your email for a confirmation link."); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); }
      else { navigate("/dashboard"); }
    }
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setMessage("Password reset link sent to your email.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-0.5 justify-center mb-10">
          <span className="font-display text-[22px] font-black text-primary">Cost</span>
          <span className="font-display text-[22px] font-bold text-foreground">IQ</span>
          <span className="text-[13px] text-muted-foreground font-mono ml-0.5">.ai</span>
        </Link>

        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-lg font-semibold text-foreground mb-1 font-body">
            {showForgot ? "Reset password" : isSignUp ? "Create your account" : "Sign in"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {showForgot
              ? "Enter your email to receive a reset link"
              : isSignUp
              ? "Start monitoring your enterprise costs"
              : "Welcome back to CostIQ"}
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded px-3 py-2 mb-4">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-cost-green/10 border border-cost-green/20 rounded px-3 py-2 mb-4">
              <p className="text-xs text-cost-green">{message}</p>
            </div>
          )}

          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center text-sm py-2.5 px-4 disabled:opacity-50">
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <button type="button" onClick={() => setShowForgot(false)}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Full name</label>
                    <input
                      type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Company name</label>
                    <input
                      type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="Optional"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Password</label>
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              {!isSignUp && (
                <button type="button" onClick={() => setShowForgot(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </button>
              )}
              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center text-sm py-2.5 px-4 disabled:opacity-50">
                {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>
          )}

          {!showForgot && (
            <p className="text-xs text-muted-foreground text-center mt-5">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
                className="text-primary hover:underline">
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
