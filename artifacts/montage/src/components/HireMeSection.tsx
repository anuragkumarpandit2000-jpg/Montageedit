import { Mail } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { CinematicButton } from "./CinematicButton";

export function HireMeSection() {
  return (
    <AnimatedSection id="hire" className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow-primary">Request a Paid Edit</h2>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Need a professional touch for your next project? Whether it's a YouTube video, a commercial montage, or viral short-form content, I'm ready to bring your vision to life.
        </p>

        <div className="bg-card border border-primary/20 rounded-2xl p-8 max-w-md mx-auto hover:border-primary/50 transition-colors hover:box-glow-primary">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Mail className="w-8 h-8" />
            </div>
            
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Email Me Directly</p>
              <a 
                href="mailto:anuragkumar.pandit2000@gmail.com" 
                className="text-lg md:text-xl font-bold text-white hover:text-primary transition-colors break-all"
              >
                anuragkumar.pandit2000<wbr/>@gmail.com
              </a>
            </div>

            <CinematicButton 
              href="mailto:anuragkumar.pandit2000@gmail.com" 
              variant="primary"
              className="w-full mt-4"
            >
              Contact Now
            </CinematicButton>
          </div>
        </div>

      </div>
    </AnimatedSection>
  );
}
