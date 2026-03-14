import { Instagram, Youtube, Film } from "lucide-react";

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
          <a href="https://instagram.com/parker_montage" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all box-glow-primary">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all box-glow-primary">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all box-glow-primary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
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
