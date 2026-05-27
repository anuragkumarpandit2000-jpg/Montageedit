import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, MessageCircle, Mail, User, FileText, IndianRupee } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const WHATSAPP_NUMBER = "917520560526";
const CONTACT_EMAIL = "anuragkumar.pandit2000@gmail.com";

const BUDGET_OPTIONS = [
  "Under ₹500",
  "₹500 – ₹1,000",
  "₹1,000 – ₹2,500",
  "₹2,500 – ₹5,000",
  "₹5,000+",
  "Let's discuss",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [sent, setSent] = useState(false);

  function buildWhatsAppMessage() {
    const lines = [
      `👋 Hi Anurag! I found you on Montage.`,
      ``,
      `*Name:* ${name.trim()}`,
      `*Project:* ${description.trim()}`,
      budget ? `*Budget:* ${budget}` : "",
    ].filter((l) => l !== undefined);
    return encodeURIComponent(lines.join("\n"));
  }

  function buildMailtoLink() {
    const subject = encodeURIComponent(`Project Inquiry from ${name.trim()}`);
    const body = encodeURIComponent(
      `Hi Anurag,\n\nMy name is ${name.trim()}.\n\nProject details:\n${description.trim()}${budget ? `\n\nBudget: ${budget}` : ""}\n\nLooking forward to hearing from you!`
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  function handleWhatsApp(e: React.MouseEvent) {
    if (!name.trim() || !description.trim()) {
      e.preventDefault();
      return;
    }
    setSent(true);
  }

  function handleEmail(e: React.MouseEvent) {
    if (!name.trim() || !description.trim()) {
      e.preventDefault();
      return;
    }
    setSent(true);
  }

  const isValid = name.trim().length > 0 && description.trim().length > 0;

  return (
    <AnimatedSection id="contact" className="py-24 relative z-10">
      <div className="max-w-2xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-5">
            <Send className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Send a Message</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cinematic-gradient-text inline-block">
            Let's Work Together
          </h2>
          <p className="text-muted-foreground text-lg">
            Fill in your details and reach out via WhatsApp or Email — I'll get back to you fast.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50 mt-6" />
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-5 py-16 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Message sent!</h3>
              <p className="text-muted-foreground max-w-sm">
                Your inquiry is on its way. I'll reply as soon as possible.
              </p>
              <button
                onClick={() => { setSent(false); setName(""); setDescription(""); setBudget(""); }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-white/[0.07] rounded-2xl p-8 flex flex-col gap-5 shadow-[0_0_60px_rgba(99,102,241,0.08)]"
            >
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-primary/60 transition-all"
                />
              </div>

              {/* Project Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Project Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell me about your project — type of edit, platform, style, deadline…"
                  rows={4}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-primary/60 transition-all resize-none"
                />
              </div>

              {/* Budget */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <IndianRupee className="w-3.5 h-3.5" /> Budget <span className="normal-case text-white/30 font-normal">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBudget(budget === opt ? "" : opt)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        budget === opt
                          ? "bg-primary/20 border-primary/60 text-primary"
                          : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {!isValid && (name || description) && (
                <p className="text-xs text-amber-400/80">Please fill in your name and project description to continue.</p>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <a
                  href={isValid ? `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}` : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={isValid ? handleWhatsApp : (e) => e.preventDefault()}
                  className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    isValid
                      ? "bg-[#25D366] hover:bg-[#20bc5a] text-white shadow-[0_0_24px_rgba(37,211,102,0.35)] hover:shadow-[0_0_32px_rgba(37,211,102,0.5)] cursor-pointer"
                      : "bg-[#25D366]/30 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <MessageCircle className="w-4.5 h-4.5 w-5 h-5" />
                  WhatsApp Me
                </a>

                <a
                  href={isValid ? buildMailtoLink() : undefined}
                  onClick={isValid ? handleEmail : (e) => e.preventDefault()}
                  className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    isValid
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:opacity-90 cursor-pointer"
                      : "bg-primary/20 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  Send Email
                </a>
              </div>

              <p className="text-center text-xs text-white/20 -mt-1">
                WhatsApp opens the app · Email opens your mail client
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedSection>
  );
}
