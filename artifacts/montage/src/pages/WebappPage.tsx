import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MonitorSmartphone, Plus, Trash2, ExternalLink, Mail, X, Upload, Link } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

const CONTACT_EMAIL = "anuragkumar.pandit2000@gmail.com";

interface Webapp {
  id: number;
  title: string;
  websiteUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

function AddWebappCard({ onAdded }: { onAdded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function reset() {
    setTitle(""); setWebsiteUrl(""); setThumbnailFile(null); setPreviewUrl(null);
    setError(""); setOpen(false); setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !websiteUrl.trim()) { setError("Title and website URL are required."); return; }
    setUploading(true); setError("");

    try {
      let thumbnailUrl: string | null = null;

      if (thumbnailFile) {
        const urlRes = await fetch("/api/storage/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: thumbnailFile.name, contentType: thumbnailFile.type }),
        });
        if (urlRes.ok) {
          const { uploadURL, objectPath, fields } = await urlRes.json();
          const fd = new FormData();
          if (fields) Object.entries(fields).forEach(([k, v]) => fd.append(k, v as string));
          fd.append("file", thumbnailFile);
          await fetch(uploadURL, { method: "POST", body: fd });
          thumbnailUrl = objectPath;
        }
      }

      const res = await fetch("/api/webapps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), websiteUrl: websiteUrl.trim(), thumbnailUrl }),
      });
      if (!res.ok) throw new Error("Failed to save");
      reset();
      onAdded();
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!open) {
    return (
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="aspect-video rounded-2xl border-2 border-dashed border-indigo-500/35 bg-indigo-500/[0.04] hover:bg-indigo-500/[0.09] hover:border-indigo-400/60 flex flex-col items-center justify-center gap-4 w-full cursor-pointer group transition-all duration-300"
      >
        <div className="w-14 h-14 rounded-full bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
          <Plus className="w-7 h-7 text-indigo-400 group-hover:text-indigo-200 transition-colors" />
        </div>
        <p className="text-sm font-semibold text-indigo-300/85">Add Webapp</p>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-primary/40 bg-[#0a0a1c] p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">Add New Webapp</span>
        <button onClick={reset} className="text-white/30 hover:text-white/70 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="App / Project name"
          className="w-full bg-white/5 border border-white/12 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/28 focus:outline-none focus:border-primary/65 transition-all"
        />

        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/60" />
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="Paste website URL (https://...)"
            className="w-full bg-white/5 border border-white/12 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/28 focus:outline-none focus:border-primary/65 transition-all"
          />
        </div>

        {/* Thumbnail upload */}
        <div>
          <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">
            Thumbnail Image (optional)
          </label>
          {previewUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setThumbnailFile(null); setPreviewUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white/70 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-white/15 hover:border-primary/40 bg-white/[0.02] hover:bg-white/[0.04] flex flex-col items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-6 h-6 text-white/30" />
              <span className="text-xs text-white/30">Click to upload screenshot</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-2 py-1">{error}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent disabled:opacity-40 flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(99,102,241,0.35)]"
        >
          {uploading ? "Saving..." : "Save Webapp"}
        </button>
      </form>
    </motion.div>
  );
}

function WebappCard({ webapp, isAdmin, onDelete }: { webapp: Webapp; isAdmin: boolean; onDelete: (id: number) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="group relative rounded-2xl bg-[#0b0b1c] border border-white/[0.07] overflow-hidden hover:border-primary/40 transition-all duration-300"
      whileHover={{ boxShadow: "0 16px 48px -8px rgba(99,102,241,0.35)" }}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-indigo-900/30 via-black/60 to-violet-900/25 overflow-hidden relative">
        {webapp.thumbnailUrl ? (
          <img
            src={webapp.thumbnailUrl.startsWith("http") ? webapp.thumbnailUrl : undefined}
            alt={webapp.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MonitorSmartphone className="w-12 h-12 text-indigo-400/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">{webapp.title}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{webapp.websiteUrl}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={webapp.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            title="Visit website"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {isAdmin && (
            <button
              onClick={() => onDelete(webapp.id)}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function WebappPage() {
  const [, navigate] = useLocation();
  const { user, loading, openModal } = useAuth();
  const [webapps, setWebapps] = useState<Webapp[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      openModal("webapp");
      navigate("/");
    }
  }, [user, loading, openModal, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    fetch("/api/webapps", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setWebapps(d.webapps ?? []))
      .catch(() => setWebapps([]))
      .finally(() => setLoadingData(false));
  }, [user, refreshKey]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this webapp?")) return;
    await fetch(`/api/webapps/${id}`, { method: "DELETE", credentials: "include" });
    setWebapps((prev) => prev.filter((w) => w.id !== id));
  }

  if (loading || !user) {
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <MonitorSmartphone className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">Portfolio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold cinematic-gradient-text inline-block mb-3">
            Webapp
          </h1>
          <p className="text-muted-foreground text-lg">Web applications & website projects</p>
          <div className="w-24 h-px bg-gradient-to-r from-primary/60 to-transparent mt-5" />
        </motion.div>

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loadingData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div key={i} className="aspect-video rounded-2xl bg-white/[0.04]"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.12 }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {webapps.map((w) => (
                <WebappCard
                  key={w.id}
                  webapp={w}
                  isAdmin={user.isAdmin}
                  onDelete={handleDelete}
                />
              ))}
              {user.isAdmin && (
                <AddWebappCard onAdded={() => setRefreshKey((k) => k + 1)} />
              )}
            </div>
          )}

          {!loadingData && webapps.length === 0 && !user.isAdmin && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <MonitorSmartphone className="w-10 h-10 text-indigo-400/60" />
              </div>
              <p className="text-muted-foreground font-medium text-lg mb-1">No webapps yet</p>
              <p className="text-white/25 text-sm">Projects will appear here once added</p>
            </div>
          )}
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Need a website or webapp?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Let's collaborate on building your next web project. Reach out and let's make it happen.
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
