import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { X, Eye, EyeOff, Film, Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DUST_COUNT = 28;
const PW_LABEL = "Password".split("");

type ModalView = "auth" | "forgot" | "forgot-sent";

/* ── Dust particle that scatters on card-land ── */
function DustParticle({ i, total }: { i: number; total: number }) {
  const angle = (i / total) * 360 + Math.random() * 30 - 15;
  const dist  = 40 + Math.random() * 70;
  const rad   = (angle * Math.PI) / 180;
  const size  = 1.5 + Math.random() * 3;
  return (
    <motion.span
      className="absolute bottom-0 left-1/2 rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        translateX: "-50%",
        background: i % 3 === 0 ? "#818cf8" : i % 3 === 1 ? "#a78bfa" : "#6366f1",
      }}
      initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        x: Math.cos(rad) * dist,
        y: Math.sin(rad) * dist + 20,
        scale: 0,
      }}
      transition={{ duration: 0.78, ease: "easeOut", delay: i * 0.01 }}
    />
  );
}

export function AuthModal() {
  const { modalOpen, closeModal, login, signup } = useAuth();

  /* ── view / auth state ── */
  const [view, setView]       = useState<ModalView>("auth");
  const [tab, setTab]         = useState<"login" | "signup">("login");
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [wrongPw, setWrongPw] = useState(false);
  const [showForgotLink, setShowForgotLink] = useState(false);

  /* ── forgot password state ── */
  const [forgotEmail, setForgotEmail]     = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]     = useState("");

  /* ── dust / landing ── */
  const [dustKey, setDustKey]   = useState(0);
  const [showDust, setShowDust] = useState(false);
  const [landed, setLanded]     = useState(false);

  /* ── tab flip ── */
  const flipControls = useAnimation();
  const [flipping, setFlipping] = useState(false);

  /* ── reset on open ── */
  useEffect(() => {
    if (modalOpen) {
      setView("auth"); setTab("login");
      setEmail(""); setPw(""); setConfirm("");
      setError(""); setWrongPw(false); setShowForgotLink(false);
      setForgotEmail(""); setForgotError("");
      setLanded(false); setShowDust(false);
    }
  }, [modalOpen]);

  /* ── dust + float after card lands ── */
  function onCardLanded() {
    if (landed) return;
    setLanded(true);
    setDustKey((k) => k + 1);
    setShowDust(true);
    setTimeout(() => setShowDust(false), 900);
  }

  /* ── tab switch with 3-D flip ── */
  async function switchTab(next: "login" | "signup") {
    if (flipping || tab === next) return;
    setFlipping(true);
    await flipControls.start({ rotateY: 90, transition: { duration: 0.18, ease: "easeIn" } });
    setTab(next); setError(""); setShowForgotLink(false);
    await flipControls.start({ rotateY: 0, transition: { duration: 0.18, ease: "easeOut" } });
    setFlipping(false);
  }

  /* ── main login/signup submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setShowForgotLink(false);
    if (tab === "signup" && pw !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      if (tab === "login") await login(email, pw);
      else                  await signup(email, pw);
    } catch (err: any) {
      const msg: string = err?.message ?? "Something went wrong";
      setError(msg);
      if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("invalid")) {
        setWrongPw(true);
        setShowForgotLink(true);
        setTimeout(() => setWrongPw(false), 750);
      }
    } finally {
      setLoading(false);
    }
  }

  /* ── forgot password submit ── */
  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Something went wrong.");
        return;
      }
      setView("forgot-sent");
    } catch {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-12 md:pt-16 px-4"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[12px]" />

          {/* ── card drop wrapper ── */}
          <motion.div
            key="auth-card"
            initial={{ y: -700, rotateX: -25, scale: 0.84, opacity: 0.5 }}
            animate={{ y: 0, rotateX: 0, scale: 1, opacity: 1 }}
            exit={{ y: -700, scale: 0.84, opacity: 0, rotateX: -18 }}
            transition={{ type: "spring", stiffness: 155, damping: 20, mass: 1.15 }}
            style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
            onAnimationComplete={onCardLanded}
            className="relative z-10 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* dust burst */}
            <div className="absolute bottom-0 left-0 right-0 h-0 overflow-visible pointer-events-none">
              {showDust && Array.from({ length: DUST_COUNT }).map((_, i) => (
                <DustParticle key={`${dustKey}-${i}`} i={i} total={DUST_COUNT} />
              ))}
            </div>

            {/* ── inner float ── */}
            <motion.div
              animate={landed ? { y: [0, -10, 0] } : {}}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            >
              {/* ── flip wrapper (tab switch) ── */}
              <motion.div
                animate={flipControls}
                style={{ transformPerspective: 900, transformStyle: "preserve-3d" }}
              >
                {/* ── card body ── */}
                <div className="rounded-2xl bg-[#07071a]/97 border border-indigo-500/30 shadow-[0_0_100px_rgba(99,102,241,0.4),0_0_200px_rgba(139,92,246,0.15),inset_0_0_60px_rgba(99,102,241,0.04)] overflow-hidden">

                  {/* top glow line */}
                  <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

                  {/* header */}
                  <div className="px-8 pt-7 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {view !== "auth" && (
                        <button
                          onClick={() => { setView("auth"); setForgotEmail(""); setForgotError(""); }}
                          className="p-1.5 rounded-full text-white/35 hover:text-white/80 hover:bg-white/10 transition-all mr-0.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      )}
                      <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Film className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-display font-bold text-lg tracking-widest text-glow-primary">MONTAGE</span>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-1.5 rounded-full text-white/35 hover:text-white/80 hover:bg-white/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <AnimatePresence mode="wait">

                    {/* ══════════ AUTH VIEW ══════════ */}
                    {view === "auth" && (
                      <motion.div
                        key="auth-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* tabs */}
                        <div className="px-8 flex gap-1 border-b border-white/8">
                          {(["login", "signup"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => switchTab(t)}
                              className={`relative px-4 py-2.5 text-sm font-semibold capitalize tracking-wide transition-colors ${
                                tab === t ? "text-primary" : "text-white/38 hover:text-white/65"
                              }`}
                            >
                              {t === "login" ? "Login" : "Sign Up"}
                              {tab === t && (
                                <motion.div
                                  layoutId="tab-bar"
                                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent rounded-full"
                                />
                              )}
                            </button>
                          ))}
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 pt-6 pb-7 space-y-4">
                          {/* email */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-indigo-300/75">
                              Email
                            </label>
                            <input
                              type="email"
                              autoComplete="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              placeholder="you@example.com"
                              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/22 focus:outline-none focus:border-primary/65 focus:ring-1 focus:ring-primary/35 focus:bg-indigo-500/[0.06] transition-all duration-300"
                            />
                          </div>

                          {/* password with shatter label */}
                          <div className="space-y-1.5">
                            <label className="flex text-[11px] font-bold uppercase tracking-widest overflow-visible h-4">
                              {PW_LABEL.map((ch, i) => (
                                <motion.span
                                  key={i}
                                  className="inline-block text-indigo-300/75"
                                  animate={wrongPw ? {
                                    y:       [0, -5, 32 + i * 4, 0],
                                    x:       [0, (i % 2 === 0 ? -1 : 1) * (5 + i * 2.5), 0],
                                    rotate:  [0, (i % 2 === 0 ? -55 : 55) + i * 7, (i % 2 === 0 ? 18 : -18), 0],
                                    opacity: [1, 1, 0, 1],
                                    scale:   [1, 1.2, 0.6, 1],
                                  } : { y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
                                  transition={{
                                    duration: 0.7,
                                    delay: wrongPw ? i * 0.04 : 0,
                                    ease: "easeInOut",
                                  }}
                                >
                                  {ch}
                                </motion.span>
                              ))}
                            </label>

                            <motion.div
                              className="relative"
                              animate={wrongPw
                                ? { x: [0, -20, 20, -16, 16, -10, 10, -4, 4, 0] }
                                : { x: 0 }}
                              transition={{ duration: 0.55 }}
                            >
                              <input
                                type={showPw ? "text" : "password"}
                                autoComplete={tab === "login" ? "current-password" : "new-password"}
                                value={pw}
                                onChange={(e) => { setPw(e.target.value); if (error) setError(""); }}
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
                            </motion.div>

                            {/* Forgot password link — appears after wrong password */}
                            <AnimatePresence>
                              {showForgotLink && tab === "login" && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setView("forgot");
                                      setForgotEmail(email);
                                    }}
                                    className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
                                  >
                                    Forgot Password?
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* confirm password (signup only) */}
                          <AnimatePresence>
                            {tab === "signup" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22 }}
                                className="overflow-hidden space-y-1.5"
                              >
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-indigo-300/75">
                                  Confirm Password
                                </label>
                                <input
                                  type={showPw ? "text" : "password"}
                                  autoComplete="new-password"
                                  value={confirm}
                                  onChange={(e) => setConfirm(e.target.value)}
                                  required={tab === "signup"}
                                  placeholder="••••••••"
                                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/22 focus:outline-none focus:border-primary/65 focus:ring-1 focus:ring-primary/35 focus:bg-indigo-500/[0.06] transition-all duration-300"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* error */}
                          <AnimatePresence>
                            {error && (
                              <motion.p
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                              >
                                {error}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          {/* submit */}
                          <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.025 }}
                            whileTap={{ scale: 0.975 }}
                            className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider text-white bg-gradient-to-r from-primary to-accent disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.7)] flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> {tab === "login" ? "Logging in…" : "Creating account…"}</>
                            ) : tab === "login" ? "Login" : "Create Account"}
                          </motion.button>

                          {/* switch tab hint */}
                          <p className="text-center text-[12px] text-white/30">
                            {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                              type="button"
                              onClick={() => switchTab(tab === "login" ? "signup" : "login")}
                              className="text-primary/75 hover:text-primary underline underline-offset-2 transition-colors"
                            >
                              {tab === "login" ? "Sign up" : "Login"}
                            </button>
                          </p>
                        </form>
                      </motion.div>
                    )}

                    {/* ══════════ FORGOT PASSWORD VIEW ══════════ */}
                    {view === "forgot" && (
                      <motion.div
                        key="forgot-view"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.22 }}
                      >
                        <form onSubmit={handleForgotSubmit} className="px-8 pt-5 pb-7 space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                                <Mail className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <h3 className="font-display font-bold text-white text-sm tracking-wide">Reset Password</h3>
                            </div>
                            <p className="text-white/38 text-[12px] leading-relaxed mt-2">
                              Enter your email and we'll send you a link to create a new password.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-indigo-300/75">
                              Email Address
                            </label>
                            <input
                              type="email"
                              autoComplete="email"
                              value={forgotEmail}
                              onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                              required
                              placeholder="you@example.com"
                              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/22 focus:outline-none focus:border-primary/65 focus:ring-1 focus:ring-primary/35 focus:bg-indigo-500/[0.06] transition-all duration-300"
                            />
                          </div>

                          <AnimatePresence>
                            {forgotError && (
                              <motion.p
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                              >
                                {forgotError}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <motion.button
                            type="submit"
                            disabled={forgotLoading}
                            whileHover={{ scale: 1.025 }}
                            whileTap={{ scale: 0.975 }}
                            className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider text-white bg-gradient-to-r from-primary to-accent disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.7)] flex items-center justify-center gap-2"
                          >
                            {forgotLoading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                            ) : (
                              <><Mail className="w-4 h-4" /> Send Reset Link</>
                            )}
                          </motion.button>

                          <p className="text-center text-[12px] text-white/30">
                            Remembered it?{" "}
                            <button
                              type="button"
                              onClick={() => setView("auth")}
                              className="text-primary/75 hover:text-primary underline underline-offset-2 transition-colors"
                            >
                              Back to Login
                            </button>
                          </p>
                        </form>
                      </motion.div>
                    )}

                    {/* ══════════ FORGOT SENT VIEW ══════════ */}
                    {view === "forgot-sent" && (
                      <motion.div
                        key="forgot-sent-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-8 pt-5 pb-8 text-center"
                      >
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                          className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5"
                        >
                          <CheckCircle2 className="w-7 h-7 text-green-400" />
                        </motion.div>
                        <h3 className="font-display font-bold text-white text-base mb-2">Check Your Inbox</h3>
                        <p className="text-white/42 text-[13px] leading-relaxed mb-1">
                          We've sent a password reset link to
                        </p>
                        <p className="text-primary text-[13px] font-semibold mb-5 break-all">{forgotEmail}</p>
                        <p className="text-white/28 text-[12px] mb-6">
                          The link expires in 1 hour. Check your spam folder if you don't see it.
                        </p>
                        <button
                          onClick={() => setView("auth")}
                          className="text-[12px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
                        >
                          Back to Login
                        </button>
                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* bottom glow line */}
                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/35 to-transparent" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
