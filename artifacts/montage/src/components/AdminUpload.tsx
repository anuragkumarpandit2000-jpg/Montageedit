import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Upload, Loader2 } from "lucide-react";

interface AdminUploadProps {
  category: string;
  onUploaded: () => void;
}

export function AdminUpload({ category, onUploaded }: AdminUploadProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file || !title.trim()) {
      setError("Please enter a title and select a video.");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.onload = () => resolve();
        xhr.onerror = () => reject(new Error("Upload to storage failed"));
        xhr.send(file);
      });

      const saveRes = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), category, objectPath }),
      });
      if (!saveRes.ok) throw new Error("Failed to save video metadata");

      setOpen(false);
      setTitle("");
      setFile(null);
      setProgress(0);
      onUploaded();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* Floating + button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)] border border-primary/40"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center"
            onClick={() => !uploading && setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-[#0d0d1a] border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.3)] p-7"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-primary tracking-wide">Upload Video</h3>
                <button onClick={() => !uploading && setOpen(false)} className="p-1 text-muted-foreground hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1.5">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title..."
                    disabled={uploading}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1.5">
                    Video File
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    disabled={uploading}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center gap-3 bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-3 text-sm text-white/60 hover:border-primary/50 hover:text-white transition-all"
                  >
                    <Upload className="w-4 h-4 flex-shrink-0" />
                    {file ? (
                      <span className="truncate text-white/90">{file.name}</span>
                    ) : (
                      "Select video from device"
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-indigo-300">
                      <span>Uploading…</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={uploading || !file || !title.trim()}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Video
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
