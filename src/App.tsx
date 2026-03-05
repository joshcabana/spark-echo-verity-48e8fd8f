import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import AppHeader from "@/components/AppHeader";
import PushNotificationManager from "@/components/PushNotificationManager";
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Lobby = lazy(() => import("./pages/Lobby"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LiveCall = lazy(() => import("./pages/LiveCall"));
const SparkHistory = lazy(() => import("./pages/SparkHistory"));
const Chat = lazy(() => import("./pages/Chat"));
const TokenShop = lazy(() => import("./pages/TokenShop"));
const Admin = lazy(() => import("./pages/Admin"));
const Transparency = lazy(() => import("./pages/Transparency"));
const Appeal = lazy(() => import("./pages/Appeal"));
const Profile = lazy(() => import("./pages/Profile"));
const Friendfluence = lazy(() => import("./pages/Friendfluence"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Safety = lazy(() => import("./pages/Safety"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Drops = lazy(() => import("./pages/Drops"));
const Pricing = lazy(() => import("./pages/Pricing"));
const GreenRoom = lazy(() => import("./pages/GreenRoom"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LazyFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <ErrorBoundary>
                <ScrollToTop />
                <AppHeader />
                <PushNotificationManager />
                <Suspense fallback={<LazyFallback />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/lobby" element={<ProtectedRoute requireTrust><Lobby /></ProtectedRoute>} />
                    <Route path="/call/:callId" element={<ProtectedRoute requireTrust><LiveCall /></ProtectedRoute>} />
                    <Route path="/sparks" element={<ProtectedRoute requireTrust><SparkHistory /></ProtectedRoute>} />
                    <Route path="/chat/:sparkId" element={<ProtectedRoute requireTrust><Chat /></ProtectedRoute>} />
                    <Route path="/tokens" element={<ProtectedRoute><TokenShop /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                    <Route path="/transparency" element={<Transparency />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/safety" element={<Safety />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/drops" element={<Drops />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/lander" element={<Navigate to="/" replace />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/appeal" element={<ProtectedRoute><Appeal /></ProtectedRoute>} />
                    <Route path="/appeal/:flagId" element={<ProtectedRoute><Appeal /></ProtectedRoute>} />
                    <Route path="/drops/friendfluence" element={<ProtectedRoute><Friendfluence /></ProtectedRoute>} />
                    <Route path="/green-room" element={<ProtectedRoute><GreenRoom /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
