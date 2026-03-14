import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Trash2, Download, MoreVertical, Film } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { useAuth } from "@/context/AuthContext";

interface Video {
  id: number;
  title: string;
  category: string;
  objectPath: string;
  createdAt: string;
}

interface VideoGalleryProps {
  category: string;
  refreshKey?: number;
}

export function VideoGallery({ category, refreshKey }: VideoGalleryProps) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [playingTitle, setPlayingTitle] = useState("");
  const [contextMenu, setContextMenu] = useState<{ videoId: number; x: number; y: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${category}`, { credentials: "include" });
      const data = await res.json();
      setVideos(data.videos ?? []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos, refreshKey]);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  async function handleDelete(videoId: number) {
    setContextMenu(null);
    if (!confirm("Delete this video?")) return;
    await fetch(`/api/videos/${videoId}`, { method: "DELETE", credentials: "include" });
    setVideos((v) => v.filter((vid) => vid.id !== videoId));
  }

  function handleContextMenu(e: React.MouseEvent, videoId: number) {
    if (!user?.isAdmin) return;
    e.preventDefault();
    setContextMenu({ videoId, x: e.clientX, y: e.clientY });
  }

  function handleLongPressStart(e: React.TouchEvent, videoId: number) {
    if (!user?.isAdmin) return;
    const touch = e.touches[0];
    const timer = setTimeout(() => {
      setContextMenu({ videoId, x: touch.clientX, y: touch.clientY });
    }, 600);
    setLongPressTimer(timer);
  }

  function handleLongPressEnd() {
    if (longPressTimer) clearTimeout(longPressTimer);
    setLongPressTimer(null);
  }

  function openPlayer(video: Video) {
    setPlayingId(video.id);
    setPlayingTitle(video.title);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
          <Film className="w-10 h-10 text-indigo-400/60" />
        </div>
        <p className="text-muted-foreground font-medium text-lg mb-2">No videos yet</p>
        {user?.isAdmin && (
          <p className="text-muted-foreground text-sm">Use the + button to upload your first video</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.07 }}
            className="group relative aspect-video rounded-2xl bg-[#0d0d1a] border border-white/8 overflow-hidden cursor-pointer"
            onClick={() => openPlayer(video)}
            onContextMenu={(e) => handleContextMenu(e, video.id)}
            onTouchStart={(e) => handleLongPressStart(e, video.id)}
            onTouchEnd={handleLongPressEnd}
            onTouchMove={handleLongPressEnd}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 50px -12px rgba(99,102,241,0.4)" }}
          >
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-black/60 to-violet-900/20" />

            {/* Play overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Title */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
              <p className="font-semibold text-sm text-white truncate">{video.title}</p>
            </div>

            {/* Admin kebab button */}
            {user?.isAdmin && (
              <button
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white/80 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setContextMenu({ videoId: video.id, x: rect.right, y: rect.bottom });
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[80] bg-[#12121f] border border-white/15 rounded-xl shadow-2xl overflow-hidden w-44"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 176), top: Math.min(contextMenu.y, window.innerHeight - 100) }}
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={`/api/videos/${contextMenu.videoId}/stream`}
            download
            className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => setContextMenu(null)}
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Download
          </a>
          <button
            onClick={() => handleDelete(contextMenu.videoId)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      <VideoPlayer
        videoId={playingId}
        title={playingTitle}
        onClose={() => setPlayingId(null)}
      />
    </>
  );
}
