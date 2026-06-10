import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 900),
      setTimeout(() => setPhase(4), 1200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const stack = ["REACT", "NODE.JS", "POSTGRESQL"];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.p 
        className="text-[1.5vw] tracking-[0.5em] text-white/50 mb-12 uppercase"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
      >
        Powered By
      </motion.p>

      <div className="flex flex-col items-center gap-6">
        {stack.map((tech, i) => (
          <motion.div 
            key={tech}
            className="overflow-hidden"
            initial={{ height: 0 }}
            animate={phase >= (i + 2) ? { height: 'auto' } : { height: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h2 
              className="text-[6vw] font-black tracking-tighter text-white leading-none mix-blend-overlay opacity-90"
              initial={{ y: "100%" }}
              animate={phase >= (i + 2) ? { y: "0%" } : { y: "100%" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {tech}
            </motion.h2>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="absolute top-0 bottom-0 w-[1px] bg-white/20"
        initial={{ scaleY: 0 }}
        animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </motion.div>
  );
}