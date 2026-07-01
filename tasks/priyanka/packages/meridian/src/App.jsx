import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import HeroPage from "@/pages/HeroPage";
import ComparePage from "@/pages/ComparePage";
import LoginPage from "@/pages/LoginPage";
import HistoryPage from "@/pages/HistoryPage";
import ThreatRadarPage from "@/pages/ThreatRadarPage";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

const TransitionCtx = createContext(() => {});
export const useGoto = () => useContext(TransitionCtx);

function ProtectedRoute({ component: Component }) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FFD8]" />
      </div>
    );
  }

  return isAuthenticated ? <Component /> : null;
}

export default function App() {
  const [location, setLocation] = useLocation();
  const [overlay, setOverlay] = useState("idle");

  const goto = useCallback(
    (path) => {
      setOverlay("in");
      setTimeout(() => {
        setLocation(path);
        setOverlay("out");
        setTimeout(() => setOverlay("idle"), 600);
      }, 420);
    },
    [setLocation],
  );

  const showNavbar = location !== "/" && location !== "/login";

  return (
    <AuthProvider>
      <TransitionCtx.Provider value={goto}>
        {showNavbar && <Navbar />}

        <Switch>
          <Route path="/" component={HeroPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/compare">
            {() => <ProtectedRoute component={ComparePage} />}
          </Route>
          <Route path="/history">
            {() => <ProtectedRoute component={HistoryPage} />}
          </Route>
          <Route path="/threat-radar">
            {() => <ProtectedRoute component={ThreatRadarPage} />}
          </Route>
        </Switch>

        {overlay !== "idle" && (
          <div
            className="fixed inset-0 z-[9999] bg-black pointer-events-none"
            style={{
              animation:
                overlay === "in"
                  ? "transOverlayIn 0.42s cubic-bezier(0.4,0,1,1) forwards"
                  : "transOverlayOut 0.60s cubic-bezier(0,0,0.2,1) forwards",
            }}
          />
        )}

        <Toaster />
      </TransitionCtx.Provider>
    </AuthProvider>
  );
}
