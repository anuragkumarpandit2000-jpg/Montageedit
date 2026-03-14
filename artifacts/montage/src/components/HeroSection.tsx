import { useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
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

export function HeroSection() {
  const { scrollY } = useScroll();
  /* Parallax: background moves slower than scroll */
  const bgY = useTransform(scrollY, [0, 700], ["0%", "22%"]);
  const bgOpacity = useTransform(scrollY, [0, 500], [0.3, 0.08]);

  /* Floating timing offsets for each button group */
  const floatBase = { repeat: Infinity, ease: "easeInOut" as const };

  useMemo(() => PARTICLES, []); // stable reference

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Parallax background ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
      >
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
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Student Creator
          </span>
        </motion.div>

        {/* Heading — staggered blur-reveal per line */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 uppercase leading-tight text-glow-primary"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.22, delayChildren: 0.25 },
            },
          }}
        >
          <motion.span
            className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
            variants={lineVariants}
          >
            Professional
          </motion.span>
          <motion.span className="cinematic-gradient-text" variants={lineVariants}>
            Video Editing
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-xl md:text-2xl text-muted-foreground font-light mb-8 max-w-2xl mx-auto"
        >
          Turning raw clips into cinematic stories. Building a digital empire
          from zero — one edit at a time.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* View Portfolio — float A */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ ...floatBase, duration: 3.6 }}
            >
              <CinematicButton href="#portfolio" variant="primary">
                View Portfolio
              </CinematicButton>
            </motion.div>

            {/* Get a Free Edit — float B */}
            <motion.div
              className="relative"
              animate={{ y: [0, -5, 0] }}
              transition={{ ...floatBase, duration: 4.1, delay: 0.6 }}
            >
              <span
                className="absolute -top-2.5 -right-2.5 z-20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent text-accent-foreground shadow-lg border border-accent/30"
                style={{ whiteSpace: "nowrap" }}
              >
                Limited Time
              </span>
              <CinematicButton href="#free-edit" variant="outline">
                Get a Free Edit
              </CinematicButton>
            </motion.div>
          </div>

          {/* Paid Edit — float C */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ ...floatBase, duration: 3.9, delay: 1.1 }}
          >
            <CinematicButton
              href="mailto:anuragkumar.pandit2000@gmail.com"
              variant="accent"
            >
              Paid Edit
            </CinematicButton>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <a
          href="#portfolio"
          className="text-muted-foreground hover:text-primary transition-colors flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest font-semibold">
            Scroll
          </span>
          <ChevronDown className="w-5 h-5" />
        </a>
      </motion.div>
    </section>
  );
}
