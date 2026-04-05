import { useState, useRef } from "react";
import { Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { label: "Montage Edits", value: "montage-edits" },
  { label: "Cinematic Edits", value: "cinematic-edits" },
  { label: "Lyrical Edits", value: "lyrical-edits" },
  { label: "Social Media Reels", value: "reel-edits" },
];

const BASE_URL = import.meta.env.VITE_API_URL || "";

export function UploadButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user?.isAdmin) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
    }
  }

  async function handleUpload() {
    if (!file || !title || !category) return;

    setStatus("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    formData.append("category", category);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setStatus("done");
        setProgress(100);
        setTimeout(() => {
          setOpen(false);
          setFile(null);
          setTitle("");
          setStatus("idle");
          setProgress(0);
        }, 2000);
      } else {
        setStatus("error");
        try {
          const data = JSON.parse(xhr.responseText);
          setErrorMsg(data.error || "Upload failed");
        } catch {
          setErrorMsg("Upload failed");
        }
      }
    };

    xhr.onerror = () => {
      setStatus("error");
      setErrorMsg("Network error");
    };

    xhr.send(formData);
  }

  function handleClose() {
    if (status === "uploading") return;
    setOpen(false);
    setFile(null);
    setTitle("");
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white font-semibold shadow-lg hover:scale-105 transition-transform"
        style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
      >
        <Upload className="w-5 h-5" />
        Upload Video
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Upload Video</h2>
              <button onClick={handleClose} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Picker */}
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition mb-4"
            >
              {file ? (
                <p className="text-white/80 text-sm text-center px-4">{file.name}</p>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/30 mb-2" />
                  <p className="text-white/40 text-sm">Tap to select video</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Title */}
            <input
              type="text"
              placeholder="Video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 mb-4 outline-none focus:border-primary/60"
            />

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-5 outline-none focus:border-primary/60"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#0f0f1a]">
                  {c.label}
                </option>
              ))}
            </select>

            {/* Progress */}
            {status === "uploading" && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white/50 mb-1">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success */}
            {status === "done" && (
              <div className="flex items-center gap-2 text-green-400 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span>Uploaded successfully!</span>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <p className="text-red-400 text-sm mb-4">{errorMsg}</p>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || !title || status === "uploading" || status === "done"}
              className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              {status === "uploading" ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </span>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
