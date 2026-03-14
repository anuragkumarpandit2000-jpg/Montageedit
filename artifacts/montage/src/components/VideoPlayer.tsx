import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface VideoPlayerProps {
  videoId: number | null;
  title: string;
  onClose: () => void;
}

export function VideoPlayer({ videoId, title, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoId !== null && videoRef.current) {
      videoRef.current.load();
    }
  }, [videoId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {videoId !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            aria-hidden
          />

          {/* Player card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative z-10 w-full max-w-4xl mx-4 rounded-2xl overflow-hidden bg-black border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-black/60 border-b border-white/10">
              <span className="font-display font-bold text-sm tracking-wider text-primary truncate">
                {title}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video */}
            <div className="aspect-video bg-black">
              <video
                ref={videoRef}
                src={`/api/videos/${videoId}/stream`}
                controls
                autoPlay
                className="w-full h-full"
                style={{ background: "#000" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
