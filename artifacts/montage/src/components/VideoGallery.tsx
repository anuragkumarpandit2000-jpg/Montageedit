import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Trash2, Download, MoreVertical, Film, Plus, Upload, X, Loader2, CheckCircle2 } from "lucide-react";
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

/* ─────────────────────────────────────────────
   Inline admin import card (lives inside grid)
───────────────────────────────────────────── */
function ImportCard({ category, onUploaded }: { category: string; onUploaded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "selected" | "uploading" | "done">("idle");
  const [error, setError] = useState("");

  function triggerPicker() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setTitle(picked.name.replace(/\.[^.]+$/, ""));
    setStatus("selected");
    setError("");
  }

  function reset() {
    setFile(null);
    setTitle("");
    setProgress(0);
    setStatus("idle");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleUpload() {
    if (!file || !title.trim()) return;
    setStatus("uploading");
    setError("");
    setProgress(0);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Could not get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.addEventListener("progress", (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        });
        xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error("Storage upload failed")));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      const saveRes = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), category, objectPath }),
      });
      if (!saveRes.ok) throw new Error("Failed to save video");

      setStatus("done");
      setTimeout(() => { reset(); onUploaded(); }, 900);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
      setStatus("selected");
    }
  }

  /* ── done flash ── */
  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="aspect-video rounded-2xl border border-green-500/40 bg-green-500/10 flex flex-col items-center justify-center gap-3"
      >
        <CheckCircle2 className="w-10 h-10 text-green-400" />
        <span className="text-green-300 text-sm font-semibold">Uploaded!</span>
      </motion.div>
    );
  }

  /* ── uploading ── */
  if (status === "uploading") {
    return (
      <div className="aspect-video rounded-2xl border border-primary/30 bg-[#0d0d1a] flex flex-col items-center justify-center gap-5 px-6">
        <Loader2 className="w-9 h-9 text-primary animate-spin" />
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-indigo-300/80">
            <span className="truncate max-w-[70%]">{file?.name}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ── file selected — show title input ── */
  if (status === "selected") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="aspect-video rounded-2xl border border-primary/40 bg-[#0d0d1a] flex flex-col justify-between p-5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Film className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs text-white/60 truncate">{file?.name}</span>
          </div>
          <button onClick={reset} className="text-white/30 hover:text-white/70 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title…"
            className="w-full bg-white/5 border border-white/12 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {error && <p className="text-red-400 text-[11px]">{error}</p>}
          <button
            onClick={handleUpload}
            disabled={!title.trim()}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(99,102,241,0.4)] hover:shadow-[0_0_28px_rgba(99,102,241,0.6)] transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── idle — the "+" import card ── */
  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <motion.button
        onClick={triggerPicker}
        whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}
        whileTap={{ scale: 0.97 }}
        className="aspect-video rounded-2xl border-2 border-dashed border-indigo-500/35 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-400/55 flex flex-col items-center justify-center gap-3 transition-all group cursor-pointer w-full"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="w-14 h-14 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors"
        >
          <Plus className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-300/80 group-hover:text-indigo-200 transition-colors">Import Video</p>
          <p className="text-[11px] text-white/30 mt-0.5">Click to select from device</p>
        </div>
      </motion.button>
    </>
  );
}

/* ─────────────────────────────────────────────
   Main gallery
───────────────────────────────────────────── */
export function VideoGallery({ category, refreshKey }: VideoGalleryProps) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [playingTitle, setPlayingTitle] = useState("");
  const [contextMenu, setContextMenu] = useState<{ videoId: number; x: number; y: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);

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
  }, [fetchVideos, refreshKey, internalRefresh]);

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

  /* ── skeleton ── */
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(user?.isAdmin ? 4 : 6)].map((_, i) => (
          <div key={i} className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  /* ── empty state ── */
  if (videos.length === 0) {
    return (
      <div className="space-y-6">
        {!user?.isAdmin && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
              <Film className="w-10 h-10 text-indigo-400/60" />
            </div>
            <p className="text-muted-foreground font-medium text-lg">No videos yet</p>
          </div>
        )}
        {user?.isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ImportCard
              category={category}
              onUploaded={() => setInternalRefresh((k) => k + 1)}
            />
          </div>
        )}
      </div>
    );
  }

  /* ── grid with videos + import card ── */
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Video cards */}
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-black/60 to-violet-900/20" />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
              <p className="font-semibold text-sm text-white truncate">{video.title}</p>
            </div>

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

        {/* Inline import card — only for admin, always last in grid */}
        {user?.isAdmin && (
          <AnimatePresence>
            <motion.div
              key="import-card"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: videos.length * 0.07 }}
            >
              <ImportCard
                category={category}
                onUploaded={() => setInternalRefresh((k) => k + 1)}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-[80] bg-[#12121f] border border-white/15 rounded-xl shadow-2xl overflow-hidden w-44"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 176),
            top: Math.min(contextMenu.y, window.innerHeight - 100),
          }}
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
