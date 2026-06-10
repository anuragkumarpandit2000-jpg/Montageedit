import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1300),
      setTimeout(() => setPhase(4), 1800),
      setTimeout(() => setPhase(5), 3300),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const features = [
    { title: "VIDEO GALLERY", subtitle: "Immersive playback" },
    { title: "SECURE AUTH", subtitle: "JWT Sessions" },
    { title: "ADMIN PANEL", subtitle: "Direct Uploads" }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center z-20 px-[15vw]"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={{ x: '-10%', opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full flex justify-between items-center gap-12">
        <div className="flex-1 space-y-12">
          {features.map((feat, i) => (
            <motion.div 
              key={feat.title}
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={phase >= (i + 1) ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="h-[1px] w-full bg-white/10 mb-4" />
              <motion.h2 
                className="text-[3vw] font-bold tracking-tight text-white leading-none"
              >
                {feat.title}
              </motion.h2>
              <p className="text-[1.2vw] text-white/50 tracking-wider uppercase mt-2">
                {feat.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="flex-1 h-[60vh] border border-white/10 rounded-lg relative overflow-hidden bg-black/40 backdrop-blur-sm flex flex-col"
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.9, rotateY: 15 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1000 }}
        >
          {/* Mock UI Elements */}
          <div className="h-12 border-b border-white/10 flex items-center px-6 gap-3">
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <div className="w-3 h-3 rounded-full bg-white/20" />
          </div>
          <div className="flex-1 p-6 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded w-full h-full" />
            <div className="bg-white/5 rounded w-full h-full" />
            <div className="bg-white/5 rounded w-full h-full" />
            <div className="bg-white/5 rounded w-full h-full" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}