import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, X, Clock, Flame } from "lucide-react";

const DEADLINE_KEY = "montage_deal_deadline";

function getDeadline(): number {
  const stored = localStorage.getItem(DEADLINE_KEY);
  if (stored) {
    const ts = Number(stored);
    if (ts > Date.now()) return ts;
  }
  const deadline = Date.now() + 47 * 60 * 60 * 1000 + 38 * 60 * 1000;
  localStorage.setItem(DEADLINE_KEY, String(deadline));
  return deadline;
}

export function UrgencyBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const deadline = getDeadline();
    function tick() {
      const diff = Math.max(0, deadline - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-accent/80 to-primary/80 blur-xl opacity-60" />
            <div className="relative bg-[#0c0c1e]/95 border border-indigo-500/40 rounded-2xl px-4 py-3 backdrop-blur-xl flex items-center gap-3 shadow-[0_8px_40px_rgba(99,102,241,0.4)]">

              {/* Flame icon */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center"
              >
                <Flame className="w-4 h-4 text-orange-400" />
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                  ₹500 deal ends in{" "}
                  <span className="text-accent font-black tabular-nums">
                    {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
                  </span>
                  <span className="text-white/50 font-normal"> · Only 2 spots left</span>
                </p>
                <p className="text-[11px] text-white/40 hidden sm:block">Price goes back to ₹1000 — DM now to lock in</p>
              </div>

              {/* CTA */}
              <motion.a
                href="https://www.instagram.com/think.com_1234/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                animate={{ boxShadow: ["0 0 10px rgba(167,139,250,0.4)", "0 0 22px rgba(167,139,250,0.8)", "0 0 10px rgba(167,139,250,0.4)"] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold tracking-wide"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DM Now</span>
                <span className="sm:hidden">DM</span>
              </motion.a>

              {/* Dismiss */}
              <button
                onClick={() => setDismissed(true)}
                className="flex-shrink-0 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
