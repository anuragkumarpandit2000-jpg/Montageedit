import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Video, Clapperboard } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

const SUB_OPTIONS = [
  {
    slug: "reels",
    label: "Reels",
    description: "Short-form vertical video edits for social media",
    icon: Film,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
  },
  {
    slug: "videos",
    label: "Videos",
    description: "Full-length cinematic & creative video edits",
    icon: Video,
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
  },
];

export default function EditsPage() {
  const [, navigate] = useLocation();
  const { user, loading, openModal } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      openModal("edits");
      navigate("/");
    }
  }, [user, loading, openModal, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28 pb-20 px-6 max-w-5xl mx-auto">

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Portfolio</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">Portfolio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold cinematic-gradient-text inline-block mb-3">
            Edits
          </h1>
          <p className="text-muted-foreground text-lg">Choose a category to explore</p>
          <div className="w-24 h-px bg-gradient-to-r from-primary/60 to-transparent mt-5" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SUB_OPTIONS.map((opt, index) => {
            const Icon = opt.icon;
            return (
              <motion.div
                key={opt.slug}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.12 }}
                onClick={() => navigate(`/portfolio/edits/${opt.slug}`)}
                className="group relative rounded-2xl bg-card border border-card-border cursor-pointer transition-all duration-500 hover:border-primary/60 overflow-hidden"
                whileHover={{ boxShadow: "0 30px 70px -12px rgba(99,102,241,0.45)" }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={opt.image}
                    alt={opt.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-md shadow-[0_0_35px_rgba(99,102,241,0.7)]">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold group-hover:text-primary transition-colors">
                      {opt.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
