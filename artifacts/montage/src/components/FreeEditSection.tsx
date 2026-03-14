import { Instagram, Zap } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { CinematicButton } from "./CinematicButton";

export function FreeEditSection() {
  return (
    <AnimatedSection id="free-edit" className="py-24 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-1">
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-50 animate-[spin_4s_linear_infinite] blur-md" />
          
          <div className="relative bg-card rounded-[23px] p-8 md:p-12 text-center border border-white/10 backdrop-blur-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent mb-6 box-glow-accent">
              <Zap className="w-8 h-8" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight text-white">
              Free Edit Offer
            </h2>
            
            <div className="inline-block px-4 py-1.5 rounded-md bg-destructive/20 border border-destructive/50 text-destructive font-bold text-sm tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              Limited — Only a few spots remaining
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              I'm offering free video edits to select creators to build my portfolio. Send your raw clips and let's create something cinematic together.
            </p>
            
            <CinematicButton 
              variant="accent" 
              href="https://instagram.com/montage.edits" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Instagram className="w-5 h-5 mr-2" />
              DM @montage.edits
            </CinematicButton>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
