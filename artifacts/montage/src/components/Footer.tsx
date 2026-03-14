import { Instagram, Youtube, Twitter, Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        
        <div className="flex items-center gap-3 mb-6">
          <Film className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-3xl tracking-widest text-white">
            MONTAGE
          </span>
        </div>
        
        <p className="text-muted-foreground mb-10 tracking-wider uppercase text-sm font-semibold">
          Building a digital empire from zero.
        </p>
        
        <div className="flex gap-6 mb-12">
          <a href="#" className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all box-glow-primary">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all box-glow-primary">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all box-glow-primary">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
        
        <div className="w-full border-t border-white/5 pt-8 text-center flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Montage. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed & Edited by Anurag</p>
        </div>
        
      </div>
    </footer>
  );
}
