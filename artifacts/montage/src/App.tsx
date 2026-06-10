import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EditsPage from "@/pages/EditsPage";
import EditsSubPage from "@/pages/EditsSubPage";
import WebappPage from "@/pages/WebappPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import VideoTemplate from "@/components/video/VideoTemplate";
import { CinematicLoader } from "@/components/CinematicLoader";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import { SplineLandingPage } from "@/components/SplineLandingPage";
import { useScrollSound } from "@/hooks/useScrollSound";
import { playClick } from "@/lib/sounds";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/portfolio/edits/:sub" component={EditsSubPage} />
      <Route path="/portfolio/edits" component={EditsPage} />
      <Route path="/portfolio/webapp" component={WebappPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/video" component={VideoTemplate} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);
  const [showSpline, setShowSpline] = useState(true);
  const [splineGone, setSplineGone] = useState(false);

  useScrollSound();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("button, a, [role='button']")) {
        playClick(0.16);
      }
    };
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatePresence>
          {!loaded && (
            <CinematicLoader key="loader" onComplete={() => setLoaded(true)} />
          )}
        </AnimatePresence>

        {loaded && !splineGone && (
          <SplineLandingPage onGone={() => setSplineGone(true)} />
        )}

        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
            <AuthModal />
          </AuthProvider>
        </WouterRouter>
        <WhatsAppFAB />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
