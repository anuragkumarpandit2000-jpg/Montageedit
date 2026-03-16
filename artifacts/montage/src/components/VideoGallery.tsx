import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Play, Trash2, Download, MoreVertical,
  Film, Plus, Upload, X, CheckCircle2,
} from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { useAuth } from "@/context/AuthContext";

/* ── types ── */
interface Video {
  id: number; title: string; category: string;
  objectPath: string; thumbnailUrl?: string | null; createdAt: string;
}
interface VideoGalleryProps { category: string; refreshKey?: number; }

/* ── AI thumbnail generator via Pollinations ── */
function buildThumbnailPrompt(title: string, category: string): string {
  const t = title.toLowerCase();
  let base = title;

  if (t.includes("ronaldo") || t.includes("messi") || t.includes("football") || t.includes("soccer")) {
    base = `${title} professional football player cinematic dark stadium dramatic lighting`;
  } else if (t.includes("cinematic") || t.includes("film")) {
    base = `${title} cinematic moody dark film aesthetic professional photography`;
  } else if (t.includes("lyrical") || t.includes("music") || t.includes("song")) {
    base = `${title} music artist performance stage neon lights dark aesthetic`;
  } else if (t.includes("reel") || t.includes("social") || t.includes("viral")) {
    base = `${title} social media content creator dynamic urban neon dark`;
  } else if (category === "montage-edits") {
    base = `${title} epic montage dark cinematic dramatic action`;
  } else if (category === "cinematic-edits") {
    base = `${title} cinematic dark moody professional film color grade`;
  } else if (category === "lyrical-edits") {
    base = `${title} lyrical music video aesthetic dark ambient glow`;
  } else {
    base = `${title} professional dark cinematic wallpaper 4k dramatic lighting`;
  }
  return `${base}, high quality, dark background, vibrant colors, professional, no text, no watermark`;
}

function getThumbnailUrl(title: string, category: string): string {
  const prompt = buildThumbnailPrompt(title, category);
  const seed = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=640&height=360&nologo=true&seed=${seed}`;
}

/* ═══════════════════════════════════════════
   CINEMATIC PRE-LOADER  (plays while picker
   opens in the background)
═══════════════════════════════════════════ */
function CinematicPreLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden">
      {/* Sweep scan-line */}
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400/90 to-transparent pointer-events-none"
        initial={{ y: 0 }}
        animate={{ y: ["0%", "2000%"] }}
        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
      />
      {/* Corner brackets */}
      {[["top-3 left-3","border-t border-l"],["top-3 right-3","border-t border-r"],
        ["bottom-3 left-3","border-b border-l"],["bottom-3 right-3","border-b border-r"],
      ].map(([pos, borders], i) => (
        <motion.div
          key={i}
          className={`absolute ${pos} w-5 h-5 ${borders} border-indigo-400/70`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        />
      ))}
      {/* Spinning outer ring */}
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 border-r-violet-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border border-indigo-500/40"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Film className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      {/* Animated text */}
      <div className="flex items-center gap-1 text-xs font-semibold tracking-widest text-indigo-300/80 uppercase">
        <span>Connecting to Gallery</span>
        {[0, 0.3, 0.6].map((d, i) => (
          <motion.span key={i} animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: d }}>.</motion.span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3-D UPLOAD ANIMATION
═══════════════════════════════════════════ */
const RING_R = 36;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

const PARTICLE_CONFIGS = [
  { angle: 0,   r: 58, size: 3, dur: 2.4, color: "#6366f1" },
  { angle: 45,  r: 62, size: 2, dur: 2.0, color: "#8b5cf6" },
  { angle: 90,  r: 55, size: 3.5, dur: 2.8, color: "#a78bfa" },
  { angle: 135, r: 60, size: 2, dur: 2.2, color: "#6366f1" },
  { angle: 180, r: 57, size: 3, dur: 2.6, color: "#818cf8" },
  { angle: 225, r: 63, size: 2.5, dur: 2.1, color: "#8b5cf6" },
  { angle: 270, r: 54, size: 3, dur: 2.9, color: "#6366f1" },
  { angle: 315, r: 61, size: 2, dur: 2.3, color: "#a78bfa" },
];

function UploadAnimation({ progress, fileName }: { progress: number; fileName: string }) {
  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ rotate: 360, transition: { repeat: Infinity, duration: 8, ease: "linear" } });
  }, [controls]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden">
      {/* 3-D card-forming background rect */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-indigo-500/20"
        initial={{ scaleX: 0.08, scaleY: 0.08, opacity: 0 }}
        animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "center" }}
      />
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-violet-900/20 pointer-events-none"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      />

      {/* Orbiting particles */}
      <motion.div
        animate={controls}
        className="absolute w-36 h-36 pointer-events-none"
        style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
      >
        {PARTICLE_CONFIGS.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const px = Math.cos(rad) * p.r;
          const py = Math.sin(rad) * p.r;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: p.size, height: p.size,
                background: p.color,
                top: "50%", left: "50%",
                x: px - p.size / 2, y: py - p.size / 2,
                boxShadow: `0 0 6px 1px ${p.color}80`,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: p.dur, ease: "easeInOut", delay: i * 0.18 }}
            />
          );
        })}
      </motion.div>

      {/* SVG Progress Ring */}
      <div className="relative z-10">
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="60%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle cx="48" cy="48" r={RING_R} fill="none"
            stroke="rgba(99,102,241,0.15)" strokeWidth="7" />
          {/* Progress arc */}
          <motion.circle
            cx="48" cy="48" r={RING_R}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            filter="url(#ring-glow)"
          />
        </svg>
        {/* Percentage + icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-display font-bold text-white leading-none">{progress}</span>
          <span className="text-[10px] text-indigo-300/70 font-semibold">%</span>
        </div>
      </div>

      {/* File name + bar */}
      <div className="relative z-10 w-full px-5 space-y-1.5">
        <p className="text-[11px] text-indigo-300/70 text-center truncate">{fileName}</p>
        <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-accent"
            style={{ boxShadow: "0 0 8px rgba(99,102,241,0.8)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   IMPORT CARD  (lives in the grid)
═══════════════════════════════════════════ */
type UploadStatus = "idle" | "cinematic" | "selected" | "uploading" | "done";

function ImportCard({ category, onUploaded }: { category: string; onUploaded: (thumbnailUrl?: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile]       = useState<File | null>(null);
  const [title, setTitle]     = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus]   = useState<UploadStatus>("idle");
  const [error, setError]     = useState("");

  /* Click "+": open picker immediately AND show cinematic for 1.6s */
  function triggerPicker() {
    setStatus("cinematic");
    fileRef.current?.click();
    // If user cancels the picker (no file chosen), fall back to idle
    setTimeout(() => setStatus((s) => (s === "cinematic" ? "idle" : s)), 2400);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) { setStatus("idle"); return; }
    setFile(picked);
    setTitle(picked.name.replace(/\.[^.]+$/, ""));
    setStatus("selected");
    setError("");
  }

  function reset() {
    setFile(null); setTitle(""); setProgress(0);
    setStatus("idle"); setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleUpload() {
    if (!file || !title.trim()) return;
    setStatus("uploading"); setError(""); setProgress(0);
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
        xhr.onload  = () => (xhr.status < 400 ? resolve() : reject(new Error("Storage upload failed")));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(file);
      });

      const thumbnailUrl = getThumbnailUrl(title.trim(), category);

      const saveRes = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), category, objectPath, thumbnailUrl }),
      });
      if (!saveRes.ok) throw new Error("Failed to save video");

      setStatus("done");
      setTimeout(() => { reset(); onUploaded(thumbnailUrl); }, 1000);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
      setStatus("selected");
    }
  }

  /* card wrappers share same aspect ratio + border base */
  const cardBase = "aspect-video rounded-2xl relative overflow-hidden";

  /* ── DONE flash ── */
  if (status === "done") {
    return (
      <motion.div
        className={`${cardBase} border border-green-500/40 bg-green-500/8 flex flex-col items-center justify-center gap-3`}
        initial={{ scale: 1 }} animate={{ scale: [1, 1.04, 1], opacity: [1, 1, 0] }}
        transition={{ times: [0, 0.4, 1], duration: 1 }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </motion.div>
        <span className="text-green-300 text-sm font-semibold tracking-wide">Added to Gallery!</span>
      </motion.div>
    );
  }

  /* ── UPLOADING — 3-D ring animation ── */
  if (status === "uploading") {
    return (
      <div className={`${cardBase} bg-[#050510] border border-indigo-500/25`}>
        <UploadAnimation progress={progress} fileName={file?.name ?? ""} />
      </div>
    );
  }

  /* ── CINEMATIC pre-loader ── */
  if (status === "cinematic") {
    return (
      <motion.div
        className={`${cardBase} bg-[#040412] border border-indigo-500/50`}
        animate={{ boxShadow: ["0 0 0px rgba(99,102,241,0)", "0 0 40px rgba(99,102,241,0.4)", "0 0 0px rgba(99,102,241,0)"] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
      >
        <CinematicPreLoader />
      </motion.div>
    );
  }

  /* ── SELECTED — title input ── */
  if (status === "selected") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateX: -8 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 800 }}
        className={`${cardBase} bg-[#0a0a1c] border border-primary/45 flex flex-col justify-between p-5`}
      >
        {/* Top bar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Film className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs text-white/55 truncate">{file?.name}</span>
          </div>
          <button onClick={reset} className="text-white/30 hover:text-white/65 transition-colors flex-shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom actions */}
        <div className="space-y-3">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpload()}
            placeholder="Enter video title…"
            className="w-full bg-white/5 border border-white/12 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/28 focus:outline-none focus:border-primary/65 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {error && (
            <p className="text-red-400 text-[11px] bg-red-500/10 border border-red-500/20 rounded px-2 py-1">{error}</p>
          )}
          <motion.button
            onClick={handleUpload}
            disabled={!title.trim()}
            whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(99,102,241,0.55)" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(99,102,241,0.35)]"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload to Gallery
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ── IDLE — the glowing "+" card ── */
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className={`${cardBase} border-2 border-dashed border-indigo-500/35 bg-indigo-500/[0.04] hover:bg-indigo-500/[0.09] hover:border-indigo-400/60 flex flex-col items-center justify-center gap-4 w-full cursor-pointer group transition-all duration-300`}
        animate={{ boxShadow: ["0 0 0px rgba(99,102,241,0)", "0 0 22px rgba(99,102,241,0.18)", "0 0 0px rgba(99,102,241,0)"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {/* Pulsing + circle */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-500/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="relative w-16 h-16 rounded-full bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center group-hover:bg-indigo-500/25 group-hover:border-indigo-400/60 transition-colors"
          >
            <Plus className="w-8 h-8 text-indigo-400 group-hover:text-indigo-200 transition-colors" />
          </motion.div>
        </div>

        {/* Labels */}
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-indigo-300/85 group-hover:text-indigo-200 transition-colors tracking-wide">
            Import Video
          </p>
          <p className="text-[11px] text-white/28 group-hover:text-white/45 transition-colors">
            Tap to open device gallery
          </p>
        </div>
      </motion.button>
    </>
  );
}

/* ═══════════════════════════════════════════
   MAIN GALLERY
═══════════════════════════════════════════ */
export function VideoGallery({ category, refreshKey }: VideoGalleryProps) {
  const { user } = useAuth();
  const [videos, setVideos]         = useState<Video[]>([]);
  const [loading, setLoading]       = useState(true);
  const [playingId, setPlayingId]   = useState<number | null>(null);
  const [playingTitle, setPlayingTitle] = useState("");
  const [contextMenu, setContextMenu] = useState<{ videoId: number; x: number; y: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/videos/${category}`, { credentials: "include" });
      const data = await res.json();
      setVideos(data.videos ?? []);
    } catch { setVideos([]); }
    finally  { setLoading(false); }
  }, [category]);

  useEffect(() => { fetchVideos(); }, [fetchVideos, refreshKey, internalRefresh]);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  async function handleDelete(videoId: number) {
    setContextMenu(null);
    if (!confirm("Delete this video from the gallery?")) return;
    await fetch(`/api/videos/${videoId}`, { method: "DELETE", credentials: "include" });
    setVideos((v) => v.filter((vid) => vid.id !== videoId));
  }

  function showContextMenu(e: React.MouseEvent, videoId: number) {
    if (!user?.isAdmin) return;
    e.preventDefault();
    setContextMenu({ videoId, x: e.clientX, y: e.clientY });
  }

  function onLongPressStart(e: React.TouchEvent, videoId: number) {
    if (!user?.isAdmin) return;
    const touch = e.touches[0];
    const t = setTimeout(() => setContextMenu({ videoId, x: touch.clientX, y: touch.clientY }), 600);
    setLongPressTimer(t);
  }
  function onLongPressEnd() { if (longPressTimer) clearTimeout(longPressTimer); setLongPressTimer(null); }

  function openPlayer(video: Video) { setPlayingId(video.id); setPlayingTitle(video.title); }

  /* ── skeleton ── */
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div key={i} className="aspect-video rounded-2xl bg-white/[0.04]"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.12 }} />
        ))}
      </div>
    );
  }

  const renderImportCard = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="import-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.38, delay: videos.length * 0.07 }}
      >
        <ImportCard
          category={category}
          onUploaded={() => setInternalRefresh((k) => k + 1)}
        />
      </motion.div>
    </AnimatePresence>
  );

  /* ── empty state ── */
  if (videos.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {user?.isAdmin ? (
          renderImportCard()
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <motion.div
              className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5"
              animate={{ boxShadow: ["0 0 0px rgba(99,102,241,0)", "0 0 30px rgba(99,102,241,0.2)", "0 0 0px rgba(99,102,241,0)"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Film className="w-10 h-10 text-indigo-400/60" />
            </motion.div>
            <p className="text-muted-foreground font-medium text-lg mb-1">No videos yet</p>
            <p className="text-white/25 text-sm">Videos will appear here once uploaded</p>
          </div>
        )}
      </div>
    );
  }

  /* ── populated grid ── */
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Video cards */}
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.42, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-video rounded-2xl bg-[#0b0b1c] border border-white/[0.07] overflow-hidden cursor-pointer"
            onClick={() => openPlayer(video)}
            onContextMenu={(e) => showContextMenu(e, video.id)}
            onTouchStart={(e) => onLongPressStart(e, video.id)}
            onTouchEnd={onLongPressEnd}
            onTouchMove={onLongPressEnd}
            whileHover={{ scale: 1.02, boxShadow: "0 16px 48px -8px rgba(99,102,241,0.45)" }}
          >
            {/* AI Thumbnail image */}
            {(() => {
              const thumb = video.thumbnailUrl || getThumbnailUrl(video.title, video.category);
              return (
                <img
                  src={thumb}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              );
            })()}

            {/* Dark overlay so text/controls are readable */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/50 pointer-events-none" />

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-md shadow-[0_0_35px_rgba(99,102,241,0.7)]"
              >
                <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Title bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pointer-events-none">
              <p className="font-semibold text-sm text-white truncate">{video.title}</p>
            </div>

            {/* Admin kebab — only visible on hover */}
            {user?.isAdmin && (
              <button
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/85 text-white/70 hover:text-white z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setContextMenu({ videoId: video.id, x: rect.right, y: rect.bottom });
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}

        {/* Import card always appended for admin */}
        {user?.isAdmin && renderImportCard()}
      </div>

      {/* Context menu popup */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed z-[80] bg-[#10101e] border border-white/12 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.7)] overflow-hidden w-44"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 180),
              top:  Math.min(contextMenu.y + 4, window.innerHeight - 110),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={`/api/videos/${contextMenu.videoId}/stream`}
              download
              className="flex items-center gap-3 px-4 py-3.5 text-sm text-white/85 hover:text-white hover:bg-indigo-500/15 transition-all cursor-pointer"
              onClick={() => setContextMenu(null)}
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Download
            </a>
            <div className="h-px bg-white/8 mx-3" />
            <button
              onClick={() => handleDelete(contextMenu.videoId)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-400/90 hover:text-red-300 hover:bg-red-500/12 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video popup player */}
      <VideoPlayer
        videoId={playingId}
        title={playingTitle}
        onClose={() => setPlayingId(null)}
      />
    </>
  );
}
