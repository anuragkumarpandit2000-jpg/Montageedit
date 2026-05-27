import { useState, useEffect } from "react";
import { Menu, X, Film, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, openModal, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Reviews", href: "#reviews" },
    { name: "Free Edit", href: "#free-edit" },
    { name: "Hire Me", href: "#hire" },
    { name: "Contact", href: "#contact" },
    { name: "About", href: "#about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-white/5 py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 group">
          <Film className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
          <span className="font-display font-bold text-xl tracking-widest text-glow-primary">
            MONTAGE
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors tracking-wide"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Auth button area (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary/80 font-medium">
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{user.email}</span>
                {user.isAdmin && (
                  <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/25 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openModal()}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all"
            >
              Login / Sign Up
            </motion.button>
          )}
        </div>

        {/* Mobile Menu Toggle — hidden when scrolled */}
        {!isScrolled && (
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#050508] flex flex-col items-center justify-center"
          >
            <button
              className="absolute top-6 right-6 p-2 text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-2xl font-bold hover:text-primary hover:scale-110 transition-all text-glow-primary"
                >
                  {link.name}
                </a>
              ))}
              {user ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-white/60 hover:text-white text-lg font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => { openModal(); setMobileMenuOpen(false); }}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white text-lg font-bold tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  Login / Sign Up
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
