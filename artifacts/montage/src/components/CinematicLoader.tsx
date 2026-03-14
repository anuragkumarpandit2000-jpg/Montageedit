import { motion } from "framer-motion";

interface CinematicLoaderProps {
  onComplete: () => void;
}

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#050508" }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
    >
      {/* Thin gradient bar at the very top */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/5">
        <motion.div
          className="h-full rounded-r-full"
          style={{
            background: "linear-gradient(to right, #6366f1, #8b5cf6, #c084fc, #e879f9)",
            boxShadow: "0 0 12px 2px rgba(139,92,246,0.8)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={() => setTimeout(onComplete, 250)}
        />
        {/* Sparkle at the leading edge */}
        <motion.div
          className="absolute top-0 h-[2px] w-12 rounded-full"
          style={{ background: "rgba(232,121,249,0.9)", filter: "blur(4px)" }}
          initial={{ left: "0%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* Brand centre */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center select-none"
      >
        <div
          className="text-4xl font-black tracking-[0.35em] uppercase mb-4"
          style={{
            background: "linear-gradient(to right, #6366f1, #a78bfa, #e879f9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 24px rgba(139,92,246,0.6))",
          }}
        >
          MONTAGE
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.35 }}
          className="text-[10px] tracking-[0.45em] uppercase text-white/40 font-medium"
        >
          Video Editing Studio
        </motion.p>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#8b5cf6" }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
