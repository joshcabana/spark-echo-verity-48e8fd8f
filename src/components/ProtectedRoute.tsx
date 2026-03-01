import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireTrust?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requireTrust = false }: ProtectedRouteProps) => {
  const { session, isLoading, isAdmin, onboardingComplete, userTrust } = useAuth();
  const { data: featureFlags, isLoading: featureFlagsLoading } = useFeatureFlags(requireTrust);
  const location = useLocation();

  if (isLoading || (requireTrust && featureFlagsLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  if (requireTrust) {
    const requirePhone = featureFlags?.requirePhoneVerification ?? true;
    const trustComplete = !!(
      userTrust?.selfie_verified &&
      userTrust?.safety_pledge_accepted &&
      (!requirePhone || userTrust?.phone_verified)
    );

    if (!trustComplete) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // Enforce onboarding completion (except when already on onboarding)
  if (!onboardingComplete && !location.pathname.startsWith("/onboarding")) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireAdmin && !isAdmin) return <Navigate to="/lobby" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
