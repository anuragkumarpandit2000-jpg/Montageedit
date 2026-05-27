import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { Eye } from "lucide-react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    const controls = animate(from, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{display.toLocaleString("en-IN")}</>;
}

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const SESSION_KEY = "montage_visit_counted";

    async function trackAndFetch() {
      try {
        // Only count once per browser session
        if (!sessionStorage.getItem(SESSION_KEY)) {
          const res = await fetch("/api/stats/visit", { method: "POST", credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setCount(data.visitorCount);
            sessionStorage.setItem(SESSION_KEY, "1");
            return;
          }
        }
        // Already counted this session — just fetch
        const res = await fetch("/api/stats", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCount(data.visitorCount);
        }
      } catch {
        // Silently fail — counter is cosmetic
      }
    }

    trackAndFetch();
  }, []);

  if (count === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.09] bg-white/[0.03] backdrop-blur-sm"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <Eye className="w-3.5 h-3.5 text-white/40" />
      <span className="text-sm font-semibold text-white/70">
        <AnimatedNumber value={count} />
        <span className="text-white/35 font-normal ml-1">
          {count === 1 ? "visit" : "visits"}
        </span>
      </span>
    </motion.div>
  );
}
