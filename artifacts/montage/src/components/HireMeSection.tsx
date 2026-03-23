import { useState, useEffect, useMemo } from "react";
import { Mail, Star } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { CinematicButton } from "./CinematicButton";

interface ApiReview {
  id: number;
  rating: number;
}

export function HireMeSection() {
  const [reviews, setReviews] = useState<ApiReview[]>([]);

  useEffect(() => {
    fetch("/api/reviews", { credentials: "include" })
      .then((r) => r.ok ? r.json() : { reviews: [] })
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {});
  }, []);

  const avg = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  const total = reviews.length;

  return (
    <AnimatedSection id="hire" className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow-primary">Request a Paid Edit</h2>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Need a professional touch for your next project? Whether it's a YouTube video, a commercial montage, or viral short-form content, I'm ready to bring your vision to life.
        </p>

        {/* ── Average Rating Badge ── */}
        {total > 0 && (
          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-black text-white leading-none">{avg.toFixed(1)}</span>
              <div className="flex flex-col gap-1 items-start">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= Math.round(avg);
                    return (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${filled ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.7)]" : "text-white/20"}`}
                        fill={filled ? "currentColor" : "none"}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-white/45 font-medium">
                  {total} {total === 1 ? "client review" : "client reviews"}
                </span>
              </div>
            </div>
          </div>
        )}

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
