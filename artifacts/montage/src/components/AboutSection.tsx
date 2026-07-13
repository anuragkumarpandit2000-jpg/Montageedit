import { AnimatedSection } from "./AnimatedSection";
import { motion } from "framer-motion";

export function AboutSection() {
  const base = import.meta.env.BASE_URL;

  return (
    <AnimatedSection id="about" className="py-24 relative z-10 bg-background/80 overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl md:text-5xl font-bold cinematic-gradient-text inline-block mb-2">About Me</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

          {/* ── Photos column ── */}
          <div className="w-full lg:w-1/2 flex flex-col items-center gap-6">

            {/* Portrait — wide cinematic banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.25)]"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Spinning gradient border glow */}
              <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-tr from-primary via-accent to-primary animate-[spin_8s_linear_infinite] blur-sm opacity-40 pointer-events-none z-0" />
              <div className="relative w-full h-full overflow-hidden rounded-2xl bg-black z-10">
                <img
                  src={`${base}portrait-banner.jpg`}
                  alt="Anurag — Montage"
                  className="w-full h-full object-cover"
                  style={{ transform: "rotate(-90deg) scale(1.5)", transformOrigin: "center center" }}
                />
                {/* Bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
              {/* Name badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-5 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-black tracking-widest uppercase whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.6)]">
                Anurag · Editor
              </div>
            </motion.div>

            {/* Two fitness photos side by side */}
            <div className="flex gap-4 w-full max-w-sm mt-4">
              {[`${base}portfolio-img1.png`, `${base}portfolio-img2.png`].map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-primary/5 to-accent/5 shadow-[0_8px_32px_rgba(99,102,241,0.2)]"
                  style={{ aspectRatio: "3/4" }}
                >
                  {/* Glow edge */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 pointer-events-none" />
                  <img
                    src={src}
                    alt={`Portfolio ${i + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Bottom label */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold tracking-widest text-white/60 uppercase backdrop-blur-sm">
                      {i === 0 ? "Front" : "Side"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Bio column ── */}
          <div className="w-full lg:w-1/2 space-y-6 pt-2">
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed font-light">
              <p>
                <strong className="text-white font-semibold">Hi, I'm Anurag</strong> — a 16-year-old student and passionate video editor behind Montage.
              </p>
              <p>
                I love turning raw clips into cinematic edits, montages and engaging social media content. I'm constantly learning new skills like video editing, AI tools, prompting and creative storytelling to improve my work every day.
              </p>
              <p>
                My goal is not just to edit videos but to build a strong digital brand and creative community from zero. I believe that with consistency, creativity and the power of technology, anyone can grow and create something big.
              </p>
              <p>
                Currently I'm offering cinematic edits at <span className="text-accent font-bold">₹500 per edit</span> (50% off the regular price of ₹1000) to help creators level up their content and build long-term collaborations.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { val: "16", label: "Age" },
                { val: "50%", label: "Off Now" },
                { val: "∞", label: "Passion" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                  <div className="text-2xl font-black cinematic-gradient-text">{val}</div>
                  <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AnimatedSection>
  );
}
