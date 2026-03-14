import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FreeEditSection } from "@/components/FreeEditSection";
import { HireMeSection } from "@/components/HireMeSection";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <main>
        <HeroSection />
        <PortfolioSection />
        
        {/* Decorative Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <ReviewsSection />
        
        {/* Decorative Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        
        <FreeEditSection />
        <HireMeSection />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}
