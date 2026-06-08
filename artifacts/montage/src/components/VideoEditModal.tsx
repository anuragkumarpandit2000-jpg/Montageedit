import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";

interface Video {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
}

interface VideoEditModalProps {
  video: Video | null;
  onClose: () => void;
  onSaved: (updated: Video) => void;
}

export function VideoEditModal({ video, onClose, onSaved }: VideoEditModalProps) {
  const [title, setTitle] = useState(video?.title ?? "");
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!video) return null;

  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setThumbFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setThumbPreview(url);
    }
    setError("");
  }

  async function handleSave() {
    if (!title.trim()) { setError("Title cannot be empty"); return; }
    setSaving(true); setError("");

    try {
      let thumbnailUrl: string | undefined;

      if (thumbFile) {
        const urlRes = await fetch("/api/storage/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: thumbFile.name, size: thumbFile.size, contentType: thumbFile.type }),
        });
        if (!urlRes.ok) throw new Error("Could not get thumbnail upload URL");
        const { uploadURL, objectPath, fields } = await urlRes.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", uploadURL);
          xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error("Thumbnail upload failed"));
          xhr.onerror = () => reject(new Error("Network error"));
          const form = new FormData();
          if (fields) Object.entries(fields as Record<string, string>).forEach(([k, v]) => form.append(k, v));
          form.append("file", thumbFile);
          xhr.send(form);
        });

        thumbnailUrl = objectPath;
      }

      const body: Record<string, string> = { title: title.trim() };
      if (thumbnailUrl) body.thumbnailUrl = thumbnailUrl;

      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save");
      }

      const { video: updated } = await res.json();
      setDone(true);
      setTimeout(() => { onSaved(updated); onClose(); }, 900);
    } catch (err: any) {
      setError(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 28 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 28 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative z-10 w-full max-w-sm rounded-2xl bg-[#0c0c1e] border border-indigo-500/35 shadow-[0_0_70px_rgba(99,102,241,0.28)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/35 flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="font-bold text-base text-white tracking-wide">Edit Video</span>
              </div>
              <button onClick={onClose} disabled={saving} className="text-white/30 hover:text-white/70 transition-colors disabled:opacity-30">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Thumbnail preview + upload */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400/80">Thumbnail</label>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={saving}
                  className="w-full relative rounded-xl overflow-hidden border border-dashed border-indigo-500/30 bg-indigo-500/[0.05] hover:bg-indigo-500/[0.1] hover:border-indigo-400/55 transition-all group disabled:opacity-40"
                  style={{ aspectRatio: "16/9" }}
                >
                  {(thumbPreview || video.thumbnailUrl) ? (
                    <img
                      src={thumbPreview || video.thumbnailUrl!}
                      alt="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
                      <ImagePlus className="w-6 h-6 text-indigo-400/60 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Upload thumbnail</span>
                    </div>
                  )}
                  {/* Hover overlay on existing thumbnail */}
                  {(thumbPreview || video.thumbnailUrl) && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <ImagePlus className="w-5 h-5 text-white" />
                      <span className="text-xs text-white font-medium">Change thumbnail</span>
                    </div>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                {thumbFile && (
                  <p className="text-[11px] text-indigo-300/70 truncate">New: {thumbFile.name}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400/80">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && !saving && handleSave()}
                  disabled={saving}
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

              {/* Done flash */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 py-1"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 text-sm font-semibold">Saved!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              {!done && (
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-30"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving || !title.trim()}
                    whileHover={!saving ? { scale: 1.02 } : {}}
                    whileTap={!saving ? { scale: 0.97 } : {}}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(99,102,241,0.35)] transition-all"
                  >
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
