import { Instagram, Zap, Clock, Users, Flame } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { CinematicButton } from "./CinematicButton";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPOTS_TOTAL = 5;
const SPOTS_LEFT = 2;
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

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const deadline = getDeadline();
    function tick() {
      const diff = Math.max(0, deadline - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center text-2xl md:text-3xl font-black text-white tabular-nums shadow-[0_0_20px_rgba(99,102,241,0.25)]"
      >
        {display}
      </motion.div>
      <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1.5 font-semibold">{label}</span>
    </div>
  );
}

export function FreeEditSection() {
  const { h, m, s } = useCountdown();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatedSection id="free-edit" className="py-24 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-1">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-50 animate-[spin_4s_linear_infinite] blur-md" />

          <div className="relative bg-card rounded-[23px] p-8 md:p-12 text-center border border-white/10 backdrop-blur-xl">

            {/* Live badge */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <motion.span
                animate={{ opacity: pulse ? 1 : 0.3, scale: pulse ? 1.2 : 1 }}
                transition={{ duration: 0.4 }}
                className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] inline-block"
              />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Deal Ending Soon</span>
            </div>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent mb-5 box-glow-accent">
              <Zap className="w-8 h-8" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight text-white">
              50% Off — Special Deal
            </h2>

            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-2xl md:text-3xl font-black text-white/35 line-through">₹1000</span>
              <span className="text-3xl md:text-5xl font-black text-accent drop-shadow-[0_0_20px_rgba(167,139,250,0.7)]">₹500</span>
              <span className="text-lg text-white/60 font-medium">per edit</span>
            </div>

            {/* Countdown */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-1 mb-3">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Price goes back to ₹1000 in</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <TimeBlock value={h} label="hrs" />
                <span className="text-3xl font-black text-white/30 -mt-5">:</span>
                <TimeBlock value={m} label="min" />
                <span className="text-3xl font-black text-white/30 -mt-5">:</span>
                <TimeBlock value={s} label="sec" />
              </div>
            </div>

            {/* Spots remaining */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Users className="w-4 h-4 text-destructive" />
              <span className="text-sm font-bold text-white/70">Spots taken:</span>
              <div className="flex gap-1.5">
                {Array.from({ length: SPOTS_TOTAL }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
                    className={`w-5 h-5 rounded-full border-2 ${
                      i < SPOTS_TOTAL - SPOTS_LEFT
                        ? "bg-destructive border-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        : "border-white/20 bg-white/5"
                    }`}
                  />
                ))}
              </div>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-sm font-black text-destructive"
              >
                Only {SPOTS_LEFT} left!
              </motion.span>
            </div>

            {/* Urgency message */}
            <div className="flex items-center justify-center gap-2 mb-8 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/25 max-w-xl mx-auto">
              <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <p className="text-sm text-orange-300/90 font-medium">
                <span className="font-black text-orange-300">3 people</span> viewed this deal in the last hour. Don't miss out — DM now before the price resets.
              </p>
            </div>

            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Get a cinematic edit at half the price. Send your raw clips and let's create something that stands out — for just <span className="text-accent font-bold">₹500</span>.
            </p>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              animate={{ boxShadow: ["0 0 20px rgba(167,139,250,0.3)", "0 0 40px rgba(167,139,250,0.7)", "0 0 20px rgba(167,139,250,0.3)"] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block rounded-full"
            >
              <CinematicButton
                variant="accent"
                href="https://www.instagram.com/think.com_1234/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Instagram className="w-5 h-5 mr-2" />
                DM Now — Only {SPOTS_LEFT} Spots Left
              </CinematicButton>
            </motion.div>

            <p className="text-xs text-white/25 mt-4">Price returns to ₹1000 once timer hits zero</p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
