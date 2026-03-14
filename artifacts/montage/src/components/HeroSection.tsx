import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { CinematicButton } from "./CinematicButton";

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Cinematic background" 
          className="w-full h-full object-cover opacity-30 object-center mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">Student Creator</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase leading-tight text-glow-primary"
        >
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Professional</span>
          <span className="cinematic-gradient-text">Video Editing</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground font-light mb-8 max-w-2xl mx-auto"
        >
          Turning raw clips into cinematic stories. Building a digital empire from zero — one edit at a time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <CinematicButton href="#portfolio" variant="primary">
            View Portfolio
          </CinematicButton>
          <CinematicButton href="#free-edit" variant="outline">
            Get a Free Edit
          </CinematicButton>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <a href="#portfolio" className="text-muted-foreground hover:text-primary transition-colors flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-semibold">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </a>
      </motion.div>
    </section>
  );
}
