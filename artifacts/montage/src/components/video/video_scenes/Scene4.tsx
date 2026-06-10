import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const quote = "want this type of web and edit just DM me";
  const words = quote.split(" ");

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-[70vw] text-center">
        <motion.p 
          className="text-[4vw] font-light italic text-white/90 leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {words.map((word, i) => (
            <motion.span 
              key={i} 
              className="inline-block mr-[1vw]"
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={phase >= 1 ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 0, filter: 'blur(10px)', y: 20 }}
              transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </motion.p>
      </div>
    </motion.div>
  );
}