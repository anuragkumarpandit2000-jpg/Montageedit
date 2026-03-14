import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Film } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { VideoGallery } from "@/components/VideoGallery";
import { AdminUpload } from "@/components/AdminUpload";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES: Record<string, { label: string; description: string }> = {
  "montage-edits": {
    label: "Montage Edits",
    description: "High-energy gaming & action montages",
  },
  "cinematic-edits": {
    label: "Cinematic Edits",
    description: "Storytelling through visuals & emotion",
  },
  "lyrical-edits": {
    label: "Lyrical Edits",
    description: "Music-synced creative video edits",
  },
  "reel-edits": {
    label: "Social Media Reels",
    description: "Short-form viral content & reels",
  },
};

export default function PortfolioPage() {
  const [, params] = useRoute("/portfolio/:category");
  const [, navigate] = useLocation();
  const { user, loading, openModal } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const category = params?.category ?? "";
  const meta = CATEGORIES[category];

  useEffect(() => {
    if (!loading && !user) {
      openModal(category);
      navigate("/");
    }
  }, [user, loading, category, openModal, navigate]);

  if (loading || !user || !meta) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Back button */}
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Film className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">Portfolio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold cinematic-gradient-text inline-block mb-3">
            {meta.label}
          </h1>
          <p className="text-muted-foreground text-lg">{meta.description}</p>
          <div className="w-24 h-px bg-gradient-to-r from-primary/60 to-transparent mt-5" />
        </motion.div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VideoGallery category={category} refreshKey={refreshKey} />
        </motion.div>
      </main>

      {/* Admin Upload */}
      {user.isAdmin && (
        <AdminUpload
          category={category}
          onUploaded={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
