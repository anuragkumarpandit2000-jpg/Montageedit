import { useMemo, useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ChevronDown, Sparkles, Star, X, Users } from "lucide-react";
import { CinematicButton } from "./CinematicButton";

/* Deterministic particles — no random on every render */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 11) % 97) + 1.5,
  y: ((i * 53 + 7) % 95) + 2,
  size: 1.5 + (i % 3) * 1,
  duration: 3.5 + (i % 5) * 0.9,
  delay: (i * 0.28) % 4,
  opacity: 0.18 + (i % 4) * 0.1,
  color: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#a78bfa" : "#e879f9",
}));

/* Staggered blur-reveal variants for the heading lines */
const lineVariants = {
  hidden: { opacity: 0, y: 38, filter: "blur(14px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 0.61, 0.36, 1] },
  },
};

interface ApiReview {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/* ── Live site stats hook ── */
function useSiteStats() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [avgRating, setAvgRating]       = useState<number>(0);
  const [reviewCount, setReviewCount]   = useState<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayRef = useRef<number>(0);

  useEffect(() => {
    fetch("/api/stats/visit", { method: "POST", credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        displayRef.current = d.visitorCount ?? 20000;
        setVisitorCount(d.visitorCount ?? 20000);
      })
      .catch(() => setVisitorCount(20183));

    fetch("/api/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setAvgRating(d.avgRating ?? 0);
        setReviewCount(d.reviewCount ?? 0);
      })
      .catch(() => {});

    tickRef.current = setInterval(() => {
      const bump = Math.random() > 0.4 ? 1 : 0;
      displayRef.current += bump;
      setVisitorCount((v) => (v !== null ? v + bump : v));
    }, 6000);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  return { visitorCount, avgRating, reviewCount };
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

/* ── Live visitor badge ── */
function LiveVisitorBadge({ count }: { count: number | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-sm mb-4"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Users className="w-3.5 h-3.5 text-green-400" />
      <span className="text-xs font-bold text-green-300 tracking-widest">
        {count !== null ? (
          <motion.span key={count} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {formatCount(count)}
          </motion.span>
        ) : "…"} VISITORS
      </span>
    </motion.div>
  );
}

/* ── Live rating row ── */
function LiveRatingRow({ avg, total }: { avg: number; total: number }) {
  if (total === 0 && avg === 0) return null;
  const stars = Math.round(avg * 2) / 2;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.5 }}
      className="flex items-center gap-2 justify-center"
    >
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${s <= stars ? "text-yellow-400 fill-yellow-400" : s - 0.5 <= stars ? "text-yellow-400 fill-yellow-400/50" : "text-white/20"}`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-yellow-300">{avg > 0 ? avg.toFixed(1) : "—"} ⭐</span>
      <span className="text-xs text-white/40">/ 5 ⭐</span>
      {total > 0 && <span className="text-[11px] text-white/30 ml-1">({total} reviews)</span>}
    </motion.div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />
      ))}
    </div>
  );
}

/* ── View All Reviews Modal (real API data) ── */
function AllReviewsModal({ onClose }: { onClose: () => void }) {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews", { credentials: "include" })
      .then((r) => r.ok ? r.json() : { reviews: [] })
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.88, y: 28, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 28, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-[#0c0c1e] border border-indigo-500/35 shadow-[0_0_60px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-sm text-white tracking-wide">Client Reviews</span>
            {!loading && (
              <span className="text-[11px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                {reviews.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {loading ? (
            <p className="text-center text-white/30 text-sm py-8">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-8">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4 hover:border-indigo-500/25 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {r.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-white">{r.authorName}</span>
                      <StarRow rating={r.rating} />
                    </div>
                    <p className="text-xs text-white/55 leading-relaxed">{r.comment}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ["0%", "22%"]);
  const bgOpacity = useTransform(scrollY, [0, 500], [0.3, 0.08]);
  const floatBase = { repeat: Infinity, ease: "easeInOut" as const };

  const [showAll, setShowAll] = useState(false);
  const { visitorCount, avgRating, reviewCount } = useSiteStats();

  useMemo(() => PARTICLES, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Parallax background ── */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <motion.img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Cinematic background"
          className="w-full h-full object-cover object-center mix-blend-screen"
          style={{ opacity: bgOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
      </motion.div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <span key={p.id} className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${p.size}px`, height: `${p.size}px`,
              background: p.color, opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20">

        <LiveVisitorBadge count={visitorCount} />

        <motion.div
          initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">Student Creator</span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 uppercase leading-tight text-glow-primary"
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.22, delayChildren: 0.25 } } }}
        >
          <motion.span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60" variants={lineVariants}>
            Professional
          </motion.span>
          <motion.span className="cinematic-gradient-text" variants={lineVariants}>
            Video Editing
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-xl md:text-2xl text-muted-foreground font-light mb-8 max-w-2xl mx-auto"
        >
          Turning raw clips into cinematic stories. Building a digital empire from zero — one edit at a time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          {/* Row 1 — Portfolio + Free Edit */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ ...floatBase, duration: 3.6 }}>
              <CinematicButton href="#portfolio" variant="primary">View Portfolio</CinematicButton>
            </motion.div>
            <motion.div className="relative" animate={{ y: [0, -5, 0] }} transition={{ ...floatBase, duration: 4.1, delay: 0.6 }}>
              <span className="absolute -top-2.5 -right-2.5 z-20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent text-accent-foreground shadow-lg border border-accent/30" style={{ whiteSpace: "nowrap" }}>
                Limited Time
              </span>
              <CinematicButton href="#free-edit" variant="outline">Get a Free Edit</CinematicButton>
            </motion.div>
          </div>

          {/* Paid Edit */}
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ ...floatBase, duration: 3.9, delay: 1.1 }}>
            <CinematicButton href="mailto:anuragkumar.pandit2000@gmail.com" variant="accent">
              Paid Edit
            </CinematicButton>
          </motion.div>

          {/* View All Reviews button only */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <motion.button
              onClick={() => setShowAll(true)}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(167,139,250,0.35)" }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 text-sm font-semibold text-violet-300 hover:text-violet-100 transition-all backdrop-blur-sm"
            >
              <Star className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
              View All Reviews
              {reviewCount > 0 && (
                <span className="bg-violet-500/30 text-violet-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {reviewCount}
                </span>
              )}
            </motion.button>
          </motion.div>

          {/* Live rating row */}
          <LiveRatingRow avg={avgRating} total={reviewCount} />
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
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

      {/* ── Modal ── */}
      <AnimatePresence>
        {showAll && <AllReviewsModal onClose={() => setShowAll(false)} />}
      </AnimatePresence>
    </section>
  );
}
