import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Video, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { VideoGallery } from "@/components/VideoGallery";
import { useAuth } from "@/context/AuthContext";

const CONTACT_EMAIL = "anuragkumar.pandit2000@gmail.com";

const META: Record<string, { label: string; description: string; icon: typeof Film }> = {
  reels: {
    label: "Reels",
    description: "Short-form vertical video edits for social media",
    icon: Film,
  },
  videos: {
    label: "Videos",
    description: "Full-length cinematic & creative video edits",
    icon: Video,
  },
};

export default function EditsSubPage() {
  const [, params] = useRoute("/portfolio/edits/:sub");
  const [, navigate] = useLocation();
  const { user, loading, openModal } = useAuth();
  const sub = params?.sub ?? "";
  const meta = META[sub];

  useEffect(() => {
    if (!loading && !user) {
      openModal("edits");
      navigate("/");
    }
  }, [user, loading, openModal, navigate]);

  if (loading || !user || !meta) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate("/portfolio/edits")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Edits</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">Edits / {meta.label}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold cinematic-gradient-text inline-block mb-3">
            {meta.label}
          </h1>
          <p className="text-muted-foreground text-lg">{meta.description}</p>
          <div className="w-24 h-px bg-gradient-to-r from-primary/60 to-transparent mt-5" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VideoGallery category={sub} />
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 border-t border-white/5 pt-16"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-5">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Get In Touch</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Want a similar edit?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Reach out and let's bring your vision to life with a professional {meta.label.toLowerCase()} edit.
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="bg-card border border-primary/20 rounded-2xl p-8 hover:border-primary/50 transition-colors hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <div className="flex flex-col items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Email Me Directly</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-base font-bold text-white hover:text-primary transition-colors break-all"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white text-center bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(99,102,241,0.35)] mt-2"
                >
                  Contact Now
                </a>
              </div>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
