import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PortfolioPage from "@/pages/PortfolioPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import { CinematicLoader } from "@/components/CinematicLoader";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { SplineLandingPage } from "@/components/SplineLandingPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/portfolio/:category" component={PortfolioPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);
  const [showSpline, setShowSpline] = useState(true);
  const [splineGone, setSplineGone] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Step 1: Cinematic loader */}
        <AnimatePresence>
          {!loaded && (
            <CinematicLoader key="loader" onComplete={() => setLoaded(true)} />
          )}
        </AnimatePresence>

        {/* Step 2: 3D Spline landing page (fixed overlay) */}
        {loaded && !splineGone && (
          <SplineLandingPage
            onGone={() => setSplineGone(true)}
          />
        )}

        {/* Step 3: Main app (always rendered, revealed when Spline exits) */}
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
            <AuthModal />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
