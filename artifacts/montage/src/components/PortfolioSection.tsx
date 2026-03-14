import { Play } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const projects = [
  {
    title: "Montage Edits",
    category: "Gaming / Action",
    /* gaming action scene stock photo */
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    color: "primary"
  },
  {
    title: "Cinematic Edits",
    category: "Storytelling / Vlogs",
    /* cinematic film moody vibe */
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    color: "accent"
  },
  {
    title: "Lyrical Edits",
    category: "Music / Concerts",
    /* neon concert stage lyrical vibe */
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    color: "primary"
  },
  {
    title: "Social Media Reels",
    category: "Short-form / Viral",
    /* smartphone vertical video creation */
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    color: "accent"
  }
];

export function PortfolioSection() {
  return (
    <AnimatedSection id="portfolio" className="py-24 relative z-10 bg-background/50">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cinematic-gradient-text inline-block">My Work</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="group relative rounded-2xl overflow-hidden bg-card border border-card-border hover:border-primary/50 transition-all duration-500 cursor-pointer hover:box-glow-primary"
            >
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-md scale-75 group-hover:scale-100 transition-transform duration-300 box-glow-primary">
                    <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Title Section */}
              <div className="p-6 relative z-10 bg-gradient-to-t from-card to-card/90">
                <h3 className="text-2xl font-display font-bold group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
          <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Real project videos coming soon. Follow on Instagram for previews.
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}
