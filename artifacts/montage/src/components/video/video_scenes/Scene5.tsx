import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="text-center"
        initial={{ y: 50, opacity: 0 }}
        animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-[5vw] font-black tracking-widest text-white leading-none mb-6 uppercase">
          Let's Build
        </h2>
        
        <motion.div 
          className="inline-flex items-center gap-4 border border-white/20 px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={phase >= 2 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <span className="text-[1.5vw] tracking-wider text-white">DM FOR INQUIRIES</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </motion.div>
      </motion.div>

      <motion.div 
        className="absolute bottom-12 text-[1vw] tracking-[0.5em] text-white/30"
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        MONTAGE STUDIO
      </motion.div>
    </motion.div>
  );
}