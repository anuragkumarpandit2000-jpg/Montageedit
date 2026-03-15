import { Star, Quote } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const featuredReviews = [
  {
    name: "Alex V.",
    role: "Content Creator",
    text: "Montage completely transformed my raw gaming clips into an absolute movie. The pacing, the music sync—10/10."
  },
  {
    name: "Sarah M.",
    role: "Travel Vlogger",
    text: "I needed a cinematic edit for my travel vlog, and the result blew me away. The color grading is insane!"
  },
  {
    name: "David K.",
    role: "Influencer",
    text: "Fast delivery, super professional, and the visual effects were exactly what my reels needed to go viral."
  }
];

export function ReviewsSection() {
  return (
    <AnimatedSection id="reviews" className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow-accent inline-block">What Clients Say</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto opacity-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredReviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-card/50 backdrop-blur-sm border border-card-border p-8 rounded-2xl relative group hover:border-accent/50 transition-colors"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5 group-hover:text-accent/20 transition-colors" />

              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" fill="currentColor" />
                ))}
              </div>

              <p className="text-lg text-foreground/90 mb-8 leading-relaxed italic">
                "{review.text}"
              </p>

              <div>
                <h4 className="font-bold text-white font-display">{review.name}</h4>
                <p className="text-sm text-accent">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
