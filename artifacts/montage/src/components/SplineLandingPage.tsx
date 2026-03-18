import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

interface SplineLandingPageProps {
  onGone: () => void;
}

export function SplineLandingPage({ onGone }: SplineLandingPageProps) {
  const [shouldExit, setShouldExit] = useState(false);
  const exitTriggered = useRef(false);

  const triggerExit = () => {
    if (exitTriggered.current) return;
    exitTriggered.current = true;
    setShouldExit(true);
  };

  useEffect(() => {
    const onWheel = () => triggerExit();
    const onTouchMove = () => triggerExit();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", " ", "Enter"].includes(e.key)) triggerExit();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onGone}>
      {!shouldExit && (
        <motion.div
          key="spline-landing"
          className="fixed inset-0 z-[100] bg-black overflow-hidden"
          initial={{ y: 0, opacity: 1 }}
          exit={{
            y: "-100%",
            opacity: 0,
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Spotlight beam */}
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />

          {/* Grain texture overlay */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
              backgroundSize: "128px 128px",
            }}
          />

          {/* Ambient purple glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none z-[1]" />
          <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-violet-700/8 blur-[100px] pointer-events-none z-[1]" />

          {/* Main layout */}
          <div className="relative z-10 flex flex-col md:flex-row h-full">
            {/* ── Left: Text content ── */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20 md:pt-0 pb-24 md:pb-0">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 w-fit"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-widest uppercase text-indigo-300">
                  Video Editing Studio
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
                className="text-6xl md:text-7xl lg:text-8xl font-display font-black leading-[0.9] tracking-tight"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40">
                  MON
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-indigo-300 via-violet-400 to-indigo-500">
                  TAGE
                </span>
              </motion.h1>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
                className="origin-left w-20 h-px bg-gradient-to-r from-indigo-500 to-transparent my-7"
              />

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-white/50 text-base md:text-lg max-w-sm leading-relaxed"
              >
                Cinematic storytelling through motion.
                <br />
                Every frame crafted with intent.
              </motion.p>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                onClick={triggerExit}
                className="mt-10 w-fit group flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 text-sm font-semibold text-white/70 hover:text-white"
              >
                Enter Portfolio
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500/40 flex items-center justify-center transition-all">
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-y-0.5 transition-transform" />
                </span>
              </motion.button>
            </div>

            {/* ── Right: Spline 3D scene ── */}
            <div className="flex-1 relative min-h-[40vh] md:min-h-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1.2 }}
                className="absolute inset-0"
              >
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </motion.div>
            </div>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/25">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            >
              <ChevronDown className="w-4 h-4 text-white/20" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
