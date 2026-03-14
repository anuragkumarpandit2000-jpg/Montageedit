import { useState } from "react";
import { Star, Quote, Send, MessageSquarePlus } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  rating: number;
  comment: string;
  id: number;
}

function StarRating({
  rating,
  hovered,
  onRate,
  onHover,
  onLeave,
}: {
  rating: number;
  hovered: number;
  onRate: (n: number) => void;
  onHover: (n: number) => void;
  onLeave: () => void;
}) {
  return (
    <div className="flex gap-2" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hovered || rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            className="transition-transform duration-150 hover:scale-125 focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-all duration-200 ${
                active
                  ? "text-primary drop-shadow-[0_0_10px_rgba(99,102,241,0.9)]"
                  : "text-white/20"
              }`}
              fill={active ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="bg-card/50 backdrop-blur-sm border border-card-border p-6 rounded-2xl relative group hover:border-primary/50 transition-colors"
    >
      <Quote className="absolute top-5 right-5 w-7 h-7 text-white/5 group-hover:text-primary/20 transition-colors" />

      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 transition-colors ${
              star <= review.rating
                ? "text-primary drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]"
                : "text-white/15"
            }`}
            fill={star <= review.rating ? "currentColor" : "none"}
          />
        ))}
      </div>

      <p className="text-base text-foreground/90 leading-relaxed italic">
        "{review.comment}"
      </p>
    </motion.div>
  );
}

export function ClientReviewForm() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 5) {
      setError("Please write a comment (at least 5 characters).");
      return;
    }

    setReviews((prev) => [
      { rating, comment: comment.trim(), id: Date.now() },
      ...prev,
    ]);
    setRating(0);
    setHovered(0);
    setComment("");
    setError("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <AnimatedSection id="client-reviews" className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-6">
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Share Your Experience</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow-primary inline-block">
            Leave a Review
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50" />
        </div>

        {/* Form card */}
        <div className="relative rounded-3xl overflow-hidden p-px mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-30 blur-md" />
          <form
            onSubmit={handleSubmit}
            className="relative bg-card rounded-[23px] p-8 md:p-10 border border-white/10 backdrop-blur-xl"
          >
            <div className="mb-7">
              <label className="block text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Your Rating
              </label>
              <StarRating
                rating={rating}
                hovered={hovered}
                onRate={setRating}
                onHover={setHovered}
                onLeave={() => setHovered(0)}
              />
            </div>

            <div className="mb-7">
              <label className="block text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Your Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (error) setError("");
                }}
                rows={4}
                placeholder="Tell others about your experience with Montage..."
                className="w-full rounded-xl bg-background/60 border border-white/10 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 resize-none transition-all"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-sm font-medium mb-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {submitted && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-green-400 text-sm font-medium mb-4"
                >
                  Review submitted! Thank you.
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-3.5 font-semibold tracking-wider rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 box-glow-primary transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
              Submit Review
            </button>
          </form>
        </div>

        {/* Submitted reviews list */}
        <AnimatePresence>
          {reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground mb-6 text-center">
                Recent Reviews
              </h3>
              {reviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedSection>
  );
}
