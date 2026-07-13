import { AnimatedSection } from "./AnimatedSection";

export function AboutSection() {
  return (
    <AnimatedSection id="about" className="py-24 relative z-10 bg-background/80">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          {/* Profile Image */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full p-1">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent animate-[spin_10s_linear_infinite] blur-md opacity-70" />
              <img 
                src={`${import.meta.env.BASE_URL}images/profile-silhouette.png`}
                alt="Anurag - Montage Video Editor"
                className="relative z-10 w-full h-full object-cover rounded-full border-4 border-background"
              />
            </div>
          </div>

          {/* Bio Content */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-2 cinematic-gradient-text inline-block">About Me</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-transparent" />
            </div>

            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed font-light">
              <p>
                <strong className="text-white font-medium">Hi, I'm Anurag</strong>, a 16-year-old student and passionate video editor behind Montage.
              </p>
              <p>
                I love turning raw clips into cinematic edits, montages and engaging social media content. I'm constantly learning new skills like video editing, AI tools, prompting and creative storytelling to improve my work every day.
              </p>
              <p>
                My goal is not just to edit videos but to build a strong digital brand and creative community from zero. I believe that with consistency, creativity and the power of technology, anyone can grow and create something big.
              </p>
              <p>
                Currently I'm offering cinematic edits at ₹500 per edit (50% off the regular price of ₹1000) to help creators level up their content and build long-term collaborations.
              </p>
            </div>
          </div>

        </div>
      </div>
    </AnimatedSection>
  );
}
