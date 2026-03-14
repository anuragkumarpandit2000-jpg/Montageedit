import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { X, Eye, EyeOff, Film, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DUST_COUNT = 14;
const LABEL_LETTERS = "Password".split("");

function DustParticle({ index }: { index: number }) {
  const angle = (index / DUST_COUNT) * 360;
  const distance = 40 + Math.random() * 50;
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * distance;
  const ty = Math.sin(rad) * distance + 20;
  const size = 2 + Math.random() * 3;

  return (
    <motion.div
      initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x: tx, y: ty, scale: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.015 }}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-indigo-400/70"
      style={{ width: size, height: size }}
    />
  );
}

export function AuthModal() {
  const { modalOpen, closeModal, login, signup } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wrongPw, setWrongPw] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [tabDisplay, setTabDisplay] = useState<"login" | "signup">("login");
  const cardControls = useAnimation();
  const didLand = useRef(false);

  useEffect(() => {
    if (modalOpen) {
      didLand.current = false;
      setShowDust(false);
      setError("");
      setWrongPw(false);
      setEmail("");
      setPassword("");
      setConfirm("");
    }
  }, [modalOpen]);

  function onCardAnimationComplete(definition: string) {
    if (definition === "visible" && !didLand.current) {
      didLand.current = true;
      setShowDust(true);
      setTimeout(() => setShowDust(false), 900);
    }
  }

  async function switchTab(next: "login" | "signup") {
    if (flipping || tab === next) return;
    setFlipping(true);
    setError("");
    await cardControls.start({ rotateY: 90, transition: { duration: 0.2, ease: "easeIn" } });
    setTab(next);
    setTabDisplay(next);
    await cardControls.start({ rotateY: 0, transition: { duration: 0.2, ease: "easeOut" } });
    setFlipping(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (tab === "signup" && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      const msg: string = err.message || "Something went wrong";
      setError(msg);
      if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("invalid")) {
        setWrongPw(true);
        setTimeout(() => setWrongPw(false), 700);
      }
    } finally {
      setLoading(false);
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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-16 md:pt-20 px-4"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          {/* Card */}
          <motion.div
            key="auth-card"
            variants={{
              hidden: { y: -680, rotateX: -18, scale: 0.88, opacity: 0.5 },
              visible: { y: 0, rotateX: 0, scale: 1, opacity: 1 },
              exit: { y: -680, rotateX: -18, scale: 0.88, opacity: 0 },
            }}
            initial="hidden"
            animate={cardControls}
            exit="exit"
            onAnimationComplete={onCardAnimationComplete}
            style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
            transition={{ type: "spring", stiffness: 175, damping: 20 }}
            className="relative z-10 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Run entry animation on mount */}
            <AnimatePresence>
              {modalOpen && (
                <motion.div
                  key="card-inner"
                  animate={cardControls}
                  initial={false}
                  className="relative"
                  onViewportEnter={() => {
                    cardControls.start("visible");
                  }}
                />
              )}
            </AnimatePresence>

            {/* Trigger entry */}
            <CardEntry cardControls={cardControls} />

            {/* Dust particles on landing */}
            <div className="relative">
              {showDust && DUST_COUNT > 0 && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 pointer-events-none">
                  {Array.from({ length: DUST_COUNT }).map((_, i) => (
                    <DustParticle key={i} index={i} />
                  ))}
                </div>
              )}

              {/* Glass card body */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="rounded-2xl bg-[#080818]/95 border border-indigo-500/30 shadow-[0_0_80px_rgba(99,102,241,0.35),0_0_160px_rgba(139,92,246,0.15),inset_0_0_60px_rgba(99,102,241,0.04)] overflow-hidden"
              >
                {/* Top glow strip */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

                {/* Header */}
                <div className="px-8 pt-7 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Film className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-display font-bold text-lg tracking-widest text-glow-primary">
                      MONTAGE
                    </span>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1.5 rounded-full text-white/40 hover:text-white/90 hover:bg-white/10 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="px-8 pb-0 flex gap-1 border-b border-white/8">
                  {(["login", "signup"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => switchTab(t)}
                      className={`relative px-4 py-2.5 text-sm font-semibold capitalize tracking-wide transition-colors ${
                        tabDisplay === t
                          ? "text-primary"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {t === "login" ? "Login" : "Sign Up"}
                      {tabDisplay === t && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-5">
                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300/80">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/40 focus:bg-indigo-500/5 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Password field with shake + label shatter */}
                  <div className="space-y-1.5">
                    <label className="flex gap-0 text-xs font-semibold uppercase tracking-wider overflow-hidden">
                      {LABEL_LETTERS.map((letter, i) => (
                        <motion.span
                          key={i}
                          animate={
                            wrongPw
                              ? {
                                  y: [0, -(15 + Math.random() * 20), (20 + Math.random() * 15), 0],
                                  x: [0, (i % 2 === 0 ? -1 : 1) * (8 + Math.random() * 12), 0],
                                  rotate: [0, (i % 2 === 0 ? -1 : 1) * (20 + Math.random() * 30), 0],
                                  opacity: [1, 0.3, 1],
                                }
                              : { y: 0, x: 0, rotate: 0, opacity: 1 }
                          }
                          transition={{
                            duration: 0.55,
                            delay: wrongPw ? i * 0.03 : 0,
                            ease: wrongPw ? "easeOut" : "easeInOut",
                          }}
                          className="inline-block text-indigo-300/80"
                          style={{ display: letter === " " ? "inline" : "inline-block" }}
                        >
                          {letter === " " ? "\u00a0" : letter}
                        </motion.span>
                      ))}
                    </label>
                    <motion.div
                      animate={wrongPw ? { x: [0, -18, 18, -13, 13, -8, 8, -4, 4, 0] } : { x: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="relative"
                    >
                      <input
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/40 focus:bg-indigo-500/5 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </motion.div>
                  </div>

                  {/* Confirm password (signup only) */}
                  <AnimatePresence>
                    {tab === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden space-y-1.5"
                      >
                        <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300/80">
                          Confirm Password
                        </label>
                        <input
                          type={showPw ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          required={tab === "signup"}
                          placeholder="••••••••"
                          className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/40 focus:bg-indigo-500/5 transition-all duration-300"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider text-white bg-gradient-to-r from-primary to-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.65)] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {tab === "login" ? "Logging in…" : "Creating account…"}
                      </>
                    ) : tab === "login" ? (
                      "Login"
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>

                  {/* Toggle tab hint */}
                  <p className="text-center text-xs text-white/35">
                    {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => switchTab(tab === "login" ? "signup" : "login")}
                      className="text-primary/80 hover:text-primary underline underline-offset-2 transition-colors"
                    >
                      {tab === "login" ? "Sign up" : "Login"}
                    </button>
                  </p>
                </form>

                {/* Bottom glow strip */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CardEntry({ cardControls }: { cardControls: ReturnType<typeof useAnimation> }) {
  useEffect(() => {
    cardControls.start("visible");
  }, [cardControls]);
  return null;
}
