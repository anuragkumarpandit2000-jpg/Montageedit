import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-20"
      initial={{ scale: 1.1, filter: 'blur(20px)', opacity: 0 }}
      animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
      exit={{ scale: 0.9, filter: 'blur(10px)', opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center relative">
        <motion.div 
          className="overflow-hidden"
          initial={{ height: 0 }}
          animate={{ height: phase >= 1 ? 'auto' : 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h1 
            className="text-[8vw] font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-transparent leading-none"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {'MONTAGE'.split('').map((char, i) => (
              <motion.span 
                key={i} 
                style={{ display: 'inline-block' }}
                initial={{ opacity: 0, y: 100, rotateX: -90 }}
                animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: -90 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: phase >= 1 ? i * 0.08 : 0 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>
        
        <motion.div 
          className="absolute -bottom-8 left-0 right-0 flex justify-between px-2 text-[0.8vw] tracking-[0.4em] text-white/40 uppercase uppercase"
          initial={{ opacity: 0, y: -10 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <span>Cinematic</span>
          <span>Studio</span>
        </motion.div>
      </div>
    </motion.div>
  );
}