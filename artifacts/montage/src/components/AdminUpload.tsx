import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Upload, Film, FolderOpen, CheckCircle2, Loader2 } from "lucide-react";

interface AdminUploadProps {
  category: string;
  onUploaded: () => void;
}

/* ── Web Audio SFX ── */
function mkAudio(): AudioContext | null {
  try { return new (window.AudioContext || (window as any).webkitAudioContext)(); }
  catch { return null; }
}
function sfxStart() {
  const ctx = mkAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  [180, 360, 600, 960].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.setValueAtTime(f, t + i * 0.07);
    g.gain.setValueAtTime(0, t + i * 0.07);
    g.gain.linearRampToValueAtTime(0.18, t + i * 0.07 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.22);
    o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.25);
  });
}
function sfxTick(progress: number) {
  const ctx = mkAudio(); if (!ctx) return;
  const baseF = 380 + (progress / 100) * 1000;
  const t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "square"; o.frequency.setValueAtTime(baseF, t);
  o.frequency.exponentialRampToValueAtTime(baseF * 1.45, t + 0.09);
  g.gain.setValueAtTime(0.06, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  o.start(t); o.stop(t + 0.15);
}
function sfxDone() {
  const ctx = mkAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.setValueAtTime(f, t + i * 0.11);
    g.gain.setValueAtTime(0, t + i * 0.11);
    g.gain.linearRampToValueAtTime(0.22, t + i * 0.11 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.11 + 0.42);
    o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.48);
  });
}

/* ── Thumbnail: middle frame, cropped to 9:16 portrait ── */
function captureFirstFrame(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const TW = 720; const TH = 1280; // 9:16
    canvas.width = TW; canvas.height = TH;
    const ctx = canvas.getContext("2d");
    let done = false;
    const finish = (b: Blob | null) => { if (!done) { done = true; URL.revokeObjectURL(video.src); resolve(b); } };
    const timeout = setTimeout(() => finish(null), 12_000);
    video.muted = true; video.playsInline = true; video.preload = "metadata";
    video.onloadedmetadata = () => {
      const mid = isFinite(video.duration) && video.duration > 0 ? video.duration / 2 : 1;
      video.currentTime = mid;
    };
    video.onseeked = () => {
      clearTimeout(timeout);
      try {
        if (ctx) {
          const vw = video.videoWidth || 1280;
          const vh = video.videoHeight || 720;
          // Scale so height fills TH, then center-crop width to TW
          const scale = TH / vh;
          const scaledW = vw * scale;
          const sx = (scaledW - TW) / 2;
          ctx.drawImage(video, -sx, 0, scaledW, TH);
          canvas.toBlob((b) => finish(b), "image/jpeg", 0.92);
        } else { finish(null); }
      } catch { finish(null); }
    };
    video.onerror = () => { clearTimeout(timeout); finish(null); };
    video.src = URL.createObjectURL(file);
    video.load();
  });
}

function fmtSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

const RING_R = 30;
const CIRC = 2 * Math.PI * RING_R;

export function AdminUpload({ category, onUploaded }: AdminUploadProps) {
  const [open, setOpen]         = useState(false);
  const [title, setTitle]       = useState("");
  const [file, setFile]         = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");

  const fileRef       = useRef<HTMLInputElement>(null);
  const isPickingRef  = useRef(false);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef   = useRef(0);

  /* tick SFX on progress change */
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  function openPicker() {
    isPickingRef.current = true;
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTimeout(() => { isPickingRef.current = false; }, 200);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ""));
    setError("");
  }

  function handleClose() {
    if (uploading) return;
    setOpen(false);
    setTitle(""); setFile(null); setProgress(0); setError(""); setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleBackdrop() {
    if (isPickingRef.current || uploading) return;
    handleClose();
  }

  async function handleUpload() {
    if (!file || !title.trim()) { setError("Please choose a file and enter a topic."); return; }
    setError(""); setUploading(true); setProgress(0); progressRef.current = 0;

    sfxStart();
    tickIntervalRef.current = setInterval(() => sfxTick(progressRef.current), 900);

    try {
      /* Step 1 — thumbnail (background) */
      const thumbPromise = captureFirstFrame(file);

      /* Step 2 — presigned URL for video */
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Could not get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();

      /* Step 3 — upload video with XHR progress */
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            progressRef.current = pct;
            setProgress(pct);
          }
        };
        xhr.onload  = () => xhr.status < 400 ? resolve() : reject(new Error("Storage upload failed"));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(file);
      });

      /* Step 4 — upload thumbnail */
      let thumbnailUrl: string | undefined;
      try {
        const thumbBlob = await thumbPromise;
        if (thumbBlob) {
          const tRes = await fetch("/api/storage/uploads/request-url", {
            method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
            body: JSON.stringify({ name: `thumb_${Date.now()}.jpg`, size: thumbBlob.size, contentType: "image/jpeg" }),
          });
          if (tRes.ok) {
            const { uploadURL: tUrl, objectPath: tPath } = await tRes.json();
            await new Promise<void>((res, rej) => {
              const xhr = new XMLHttpRequest();
              xhr.open("PUT", tUrl);
              xhr.setRequestHeader("Content-Type", "image/jpeg");
              xhr.onload = () => res(); xhr.onerror = () => rej();
              xhr.send(thumbBlob);
            });
            thumbnailUrl = tPath;
          }
        }
      } catch { /* thumbnail optional */ }

      /* Step 5 — save metadata */
      const saveRes = await fetch("/api/videos", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ title: title.trim(), category, objectPath, thumbnailUrl }),
      });
      if (!saveRes.ok) throw new Error("Failed to save video");

      if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null; }
      sfxDone();
      setDone(true);
      setTimeout(() => { handleClose(); onUploaded(); }, 1400);
    } catch (err: any) {
      if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null; }
      setError(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const ext = file?.name.split(".").pop()?.toUpperCase() ?? "";

  return (
    <>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="video/*" className="hidden"
        onChange={handleFileChange} disabled={uploading} />

      {/* Floating FAB */}
      <motion.button
        whileHover={{ scale: 1.12, boxShadow: "0 0 40px rgba(99,102,241,0.75)" }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_28px_rgba(99,102,241,0.55)] border border-indigo-400/40"
        animate={{ boxShadow: ["0 0 18px rgba(99,102,241,0.4)", "0 0 38px rgba(99,102,241,0.7)", "0 0 18px rgba(99,102,241,0.4)"] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={handleBackdrop} />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 32 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-sm rounded-2xl bg-[#0c0c1e] border border-indigo-500/35 shadow-[0_0_70px_rgba(99,102,241,0.28)] overflow-hidden"
            >
              {/* Ambient glow top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/35 flex items-center justify-center">
                    <Film className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span className="font-display font-bold text-base text-white tracking-wide">Import Video</span>
                </div>
                <button onClick={handleClose} disabled={uploading}
                  className="text-white/30 hover:text-white/70 transition-colors disabled:opacity-30">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">

                {/* ── Section 1: Choose File ── */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400/80">
                    Choose File
                  </label>
                  <button
                    onClick={openPicker}
                    disabled={uploading}
                    className="w-full flex items-center gap-3 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/[0.05] hover:bg-indigo-500/[0.1] hover:border-indigo-400/55 px-4 py-3 transition-all group disabled:opacity-40"
                  >
                    <FolderOpen className="w-4 h-4 text-indigo-400 flex-shrink-0 group-hover:text-indigo-300 transition-colors" />
                    {file ? (
                      <span className="text-sm text-white/80 truncate flex-1 text-left">{file.name}</span>
                    ) : (
                      <span className="text-sm text-white/35 group-hover:text-white/55 transition-colors">
                        Select video from device
                      </span>
                    )}
                  </button>

                  {/* File info badges — shown after selection */}
                  <AnimatePresence>
                    {file && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 overflow-hidden"
                      >
                        <span className="text-[10px] font-mono font-semibold bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 px-2 py-0.5 rounded uppercase tracking-widest">
                          {ext}
                        </span>
                        <span className="text-[11px] text-white/40 font-mono">{fmtSize(file.size)}</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-[10px] text-green-400/70 font-semibold">Ready</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Section 2: Topic / Title ── */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400/80">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !uploading && handleUpload()}
                    placeholder="Enter video title…"
                    disabled={uploading}
                    autoComplete="off"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/25 transition-all disabled:opacity-40"
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Progress bar — shown while uploading */}
                <AnimatePresence>
                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {/* Ring + percentage row */}
                      <div className="flex items-center gap-3">
                        <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                          <defs>
                            <linearGradient id="up-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                          </defs>
                          <circle cx="32" cy="32" r={RING_R} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="5" />
                          <motion.circle cx="32" cy="32" r={RING_R} fill="none"
                            stroke="url(#up-grad)" strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={CIRC}
                            animate={{ strokeDashoffset: CIRC * (1 - progress / 100) }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-indigo-300 mb-1">
                            <span className="tracking-wide">Uploading…</span>
                            <span className="font-mono font-bold">{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-400"
                              style={{ boxShadow: "0 0 10px rgba(99,102,241,0.8)" }}
                              initial={{ width: "0%" }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                            />
                          </div>
                          <p className="text-[10px] text-white/30 mt-1 truncate">{file?.name}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Done flash */}
                <AnimatePresence>
                  {done && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2 py-2"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                      <span className="text-green-300 text-sm font-semibold tracking-wide">Added to Gallery!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload button */}
                {!done && (
                  <motion.button
                    onClick={handleUpload}
                    disabled={uploading || !file || !title.trim()}
                    whileHover={!uploading && file && title.trim() ? { scale: 1.02, boxShadow: "0 0 28px rgba(99,102,241,0.6)" } : {}}
                    whileTap={!uploading ? { scale: 0.97 } : {}}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all"
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload</>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
