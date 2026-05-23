import { useRef } from "react";
import { Play, MonitorSmartphone, Clapperboard } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

const projects = [
  {
    title: "Edits",
    category: "Reels & Videos",
    slug: "edits",
    icon: Clapperboard,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    description: "Short-form reels & full-length video edits",
  },
  {
    title: "Webapp",
    category: "Web Projects",
    slug: "webapp",
    icon: MonitorSmartphone,
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80",
    description: "Website & web application showcases",
  },
];

function ProjectCard({ project, index }: { project: (typeof projects)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { user, openModal } = useAuth();
  const [, navigate] = useLocation();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 25 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleClick() {
    if (user) {
      navigate(`/portfolio/${project.slug}`);
    } else {
      openModal(project.slug);
    }
  }

  const Icon = project.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay: index * 0.14, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <motion.div
        ref={ref}
        animate={{ y: [0, index % 2 === 0 ? -9 : -6, 0] }}
        transition={{ repeat: Infinity, duration: 4 + index * 0.6, ease: "easeInOut", delay: index * 0.35 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 900 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="group relative rounded-2xl bg-card border border-card-border cursor-pointer transition-colors duration-500 hover:border-primary/60"
        whileHover={{ boxShadow: "0 30px 70px -12px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.2)" }}
      >
        <div className="relative aspect-video overflow-hidden rounded-t-2xl">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-md scale-75 group-hover:scale-100 transition-transform duration-300 box-glow-primary">
              <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white">
              {project.category}
            </span>
          </div>
          {!user && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-300">
                🔒 Login to View
              </span>
            </div>
          )}
        </div>

        <div className="p-6 relative z-10 bg-gradient-to-t from-card to-card/90 rounded-b-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PortfolioSection() {
  return (
    <AnimatedSection id="portfolio" className="py-24 relative z-10 bg-background/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cinematic-gradient-text inline-block">
            My Work
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>

        <div className="mt-16 text-center p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
          <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Login to access the full gallery for each category.
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}
