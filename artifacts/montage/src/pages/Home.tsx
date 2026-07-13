import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { FreeEditSection } from "@/components/FreeEditSection";
import { HireMeSection } from "@/components/HireMeSection";
import { ClientReviewForm } from "@/components/ClientReviewForm";
import { ContactForm } from "@/components/ContactForm";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";
import { UrgencyBar } from "@/components/UrgencyBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <UrgencyBar />
      
      <main>
        <HeroSection />
        <PortfolioSection />

        <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <FreeEditSection />
        <HireMeSection />
        <ContactForm />
        <ClientReviewForm />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}
