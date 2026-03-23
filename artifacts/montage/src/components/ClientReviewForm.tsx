import { useState, useEffect, useMemo } from "react";
import { Star, Quote, Send, MessageSquarePlus, LogIn } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface ApiReview {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function StarRating({
  rating,
  hovered,
  onRate,
  onHover,
  onLeave,
  readonly = false,
  size = "lg",
}: {
  rating: number;
  hovered: number;
  onRate: (n: number) => void;
  onHover: (n: number) => void;
  onLeave: () => void;
  readonly?: boolean;
  size?: "sm" | "lg";
}) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-8 h-8";
  return (
    <div className="flex gap-1.5" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hovered || rating);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRate(star)}
            onMouseEnter={() => !readonly && onHover(star)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            className={`transition-transform duration-150 focus:outline-none ${readonly ? "cursor-default" : "hover:scale-125"}`}
          >
            <Star
              className={`${sizeClass} transition-all duration-200 ${
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

function ReviewCard({ review, index }: { review: ApiReview; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="bg-card/50 backdrop-blur-sm border border-card-border p-6 rounded-2xl relative group hover:border-primary/50 transition-colors"
    >
      <Quote className="absolute top-5 right-5 w-7 h-7 text-white/5 group-hover:text-primary/20 transition-colors" />

      <div className="flex gap-1 mb-3">
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

      <p className="text-base text-foreground/90 leading-relaxed italic mb-4">
        "{review.comment}"
      </p>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{review.authorName}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Rating summary bar ── */
function RatingSummary({ reviews }: { reviews: ApiReview[] }) {
  const avg = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const total = reviews.length;
  const displayAvg = avg.toFixed(1);

  if (total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center gap-4 mb-10"
    >
      <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
        {/* Big avg number */}
        <span className="text-3xl font-black text-white leading-none">{displayAvg}</span>

        {/* Stars */}
        <div className="flex flex-col gap-1">
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
            {total} {total === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function ClientReviewForm() {
  const { user, openModal } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  async function fetchReviews() {
    try {
      const res = await fetch("/api/reviews", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews ?? []);
      }
    } catch {
    } finally {
      setLoadingReviews(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      openModal();
      return;
    }

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!authorName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (comment.trim().length < 5) {
      setError("Please write a comment (at least 5 characters).");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ authorName: authorName.trim(), rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit review.");
        return;
      }
      setReviews((prev) => [data.review, ...prev]);
      setRating(0);
      setHovered(0);
      setAuthorName("");
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatedSection id="client-reviews" className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-6">
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Share Your Experience</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow-primary inline-block">
            Reviews
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50" />
        </div>

        {/* ── Average Rating Summary ── */}
        {!loadingReviews && <RatingSummary reviews={reviews} />}

        {/* ── All Reviews List ── */}
        {loadingReviews ? (
          <div className="text-center text-muted-foreground text-sm py-8">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 mb-12"
          >
            <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground mb-6 text-center">
              All Reviews ({reviews.length})
            </h3>
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </motion.div>
        ) : null}

        {/* ── Write a Review Form ── */}
        <div className="relative rounded-3xl overflow-hidden p-px">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-30 blur-md" />
          <form
            onSubmit={handleSubmit}
            className="relative bg-card rounded-[23px] p-8 md:p-10 border border-white/10 backdrop-blur-xl"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" fill="currentColor" />
              Write a Review
            </h3>

            {!user && (
              <div className="flex items-center gap-3 mb-7 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary">
                <LogIn className="w-4 h-4 shrink-0" />
                <span>
                  You need to{" "}
                  <button
                    type="button"
                    onClick={() => openModal()}
                    className="underline underline-offset-2 font-semibold hover:text-primary/80 transition-colors"
                  >
                    sign in
                  </button>{" "}
                  to submit a review.
                </span>
              </div>
            )}

            <div className="mb-7">
              <label className="block text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="How should we display your name?"
                className="w-full rounded-xl bg-background/60 border border-white/10 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 transition-all"
              />
            </div>

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
                  ✓ Review submitted! Thank you.
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 font-semibold tracking-wider rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 box-glow-primary transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </AnimatedSection>
  );
}
