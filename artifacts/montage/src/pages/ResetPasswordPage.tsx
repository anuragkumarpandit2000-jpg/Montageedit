import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Film, KeyRound, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    setToken(t);
    if (!t) setError("Invalid or missing reset token. Please request a new reset link.");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/"), 3500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[200px] bg-accent/8 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ y: -60, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-2xl bg-[#07071a]/96 border border-indigo-500/30 shadow-[0_0_90px_rgba(99,102,241,0.35),0_0_200px_rgba(139,92,246,0.12)] overflow-hidden">
          {/* top glow line */}
          <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />

          {/* header */}
          <div className="px-8 pt-7 pb-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Film className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-widest text-glow-primary">MONTAGE</span>
          </div>

          <div className="px-8 pb-8">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Password Updated!</h2>
                  <p className="text-white/45 text-sm">
                    Your password has been changed successfully. Redirecting you to the home page…
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-6 text-primary text-sm underline underline-offset-2 hover:text-primary/80 transition-colors"
                  >
                    Go now →
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-2.5 mb-6 mt-1">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                      <KeyRound className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-white text-base">Choose New Password</h2>
                      <p className="text-white/35 text-[11px]">Must be at least 6 characters</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5 mb-5 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-3"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-red-400 text-xs">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {token ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-indigo-300/75">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            required
                            placeholder="••••••••"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/22 focus:outline-none focus:border-primary/65 focus:ring-1 focus:ring-primary/35 focus:bg-indigo-500/[0.06] transition-all duration-300"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPw((s) => !s)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/28 hover:text-white/65 transition-colors"
                          >
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-indigo-300/75">
                          Confirm Password
                        </label>
                        <input
                          type={showPw ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                          required
                          placeholder="••••••••"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/22 focus:outline-none focus:border-primary/65 focus:ring-1 focus:ring-primary/35 focus:bg-indigo-500/[0.06] transition-all duration-300"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider text-white bg-gradient-to-r from-primary to-accent disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_45px_rgba(99,102,241,0.65)] flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                        ) : "Update Password"}
                      </motion.button>

                      <p className="text-center text-[12px] text-white/30">
                        <button
                          type="button"
                          onClick={() => navigate("/")}
                          className="text-primary/75 hover:text-primary underline underline-offset-2 transition-colors"
                        >
                          Back to home
                        </button>
                      </p>
                    </form>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/35 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
