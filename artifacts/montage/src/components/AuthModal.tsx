import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { X, Eye, EyeOff, Film, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DUST_COUNT = 16;
const PW_LABEL = "Password".split("");

/* ── Dust particle that scatters on card-land ── */
function DustParticle({ i, total }: { i: number; total: number }) {
  const angle = (i / total) * 360 + Math.random() * 20 - 10;
  const dist  = 30 + Math.random() * 55;
  const rad   = (angle * Math.PI) / 180;
  const size  = 1.5 + Math.random() * 2.5;
  return (
    <motion.span
      className="absolute bottom-0 left-1/2 rounded-full bg-indigo-400/70 pointer-events-none"
      style={{ width: size, height: size, translateX: "-50%" }}
      initial={{ opacity: 0.85, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x: Math.cos(rad) * dist, y: Math.sin(rad) * dist + 18, scale: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.012 }}
    />
  );
}

export function AuthModal() {
  const { modalOpen, closeModal, login, signup } = useAuth();

  /* ── state ── */
  const [tab, setTab]       = useState<"login" | "signup">("login");
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [wrongPw, setWrongPw] = useState(false);
  const [dustKey, setDustKey] = useState(0);          // increment → remount dust
  const [showDust, setShowDust] = useState(false);
  const [landed, setLanded] = useState(false);
  const flipControls = useAnimation();                 // for tab-flip
  const [flipping, setFlipping] = useState(false);

  /* ── reset form when modal opens ── */
  useEffect(() => {
    if (modalOpen) {
      setEmail(""); setPw(""); setConfirm("");
      setError(""); setWrongPw(false);
      setLanded(false); setShowDust(false);
      setTab("login");
    }
  }, [modalOpen]);

  /* ── dust + float trigger after card lands ── */
  function onCardLanded() {
    if (landed) return;
    setLanded(true);
    setDustKey((k) => k + 1);
    setShowDust(true);
    setTimeout(() => setShowDust(false), 850);
  }

  /* ── tab switch with 3-D flip ── */
  async function switchTab(next: "login" | "signup") {
    if (flipping || tab === next) return;
    setFlipping(true);
    await flipControls.start({ rotateY: 90, transition: { duration: 0.18, ease: "easeIn" } });
    setTab(next);
    setError("");
    await flipControls.start({ rotateY: 0, transition: { duration: 0.18, ease: "easeOut" } });
    setFlipping(false);
  }

  /* ── submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
        setTimeout(() => setWrongPw(false), 650);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {modalOpen && (
        /* ── overlay ── */
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-14 md:pt-20 px-4"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/78 backdrop-blur-[10px]" />

          {/* ── card drop wrapper ── */}
          <motion.div
            key="auth-card"
            initial={{ y: -640, rotateX: -20, scale: 0.88, opacity: 0.7 }}
            animate={{ y: 0, rotateX: 0, scale: 1, opacity: 1 }}
            exit={{ y: -640, scale: 0.88, opacity: 0 }}
            transition={{ type: "spring", stiffness: 172, damping: 21 }}
            style={{ transformPerspective: 1100, transformStyle: "preserve-3d" }}
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
              animate={landed ? { y: [0, -8, 0] } : {}}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
            >
              {/* ── flip wrapper (tab switch) ── */}
              <motion.div
                animate={flipControls}
                style={{ transformPerspective: 900, transformStyle: "preserve-3d" }}
              >
                {/* ── card body ── */}
                <div className="rounded-2xl bg-[#07071a]/96 border border-indigo-500/30 shadow-[0_0_90px_rgba(99,102,241,0.35),0_0_200px_rgba(139,92,246,0.12),inset_0_0_60px_rgba(99,102,241,0.04)] overflow-hidden">

                  {/* top glow line */}
                  <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />

                  {/* header */}
                  <div className="px-8 pt-7 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
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

                  {/* form */}
                  <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-5">

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
                      <label className="flex text-[11px] font-bold uppercase tracking-widest overflow-hidden">
                        {PW_LABEL.map((ch, i) => (
                          <motion.span
                            key={i}
                            className="inline-block text-indigo-300/75"
                            animate={wrongPw ? {
                              y:       [0, -(14 + i * 2.5), (18 + i * 1.5), 0],
                              x:       [0, (i % 2 === 0 ? -1 : 1) * (6 + i * 1.5), 0],
                              rotate:  [0, (i % 2 === 0 ? -1 : 1) * (15 + i * 4), 0],
                              opacity: [1, 0.25, 1],
                            } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.55, delay: wrongPw ? i * 0.035 : 0 }}
                          >
                            {ch}
                          </motion.span>
                        ))}
                      </label>

                      <motion.div
                        className="relative"
                        animate={wrongPw ? { x: [0, -16, 16, -12, 12, -8, 8, -3, 3, 0] } : { x: 0 }}
                        transition={{ duration: 0.48 }}
                      >
                        <input
                          type={showPw ? "text" : "password"}
                          autoComplete={tab === "login" ? "current-password" : "new-password"}
                          value={pw}
                          onChange={(e) => setPw(e.target.value)}
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
                      className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider text-white bg-gradient-to-r from-primary to-accent disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_45px_rgba(99,102,241,0.65)] flex items-center justify-center gap-2"
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
