import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import VerityLogo from "@/components/VerityLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <div className="p-6">
      <Skeleton className="h-5 w-16" />
    </div>
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Skeleton className="h-9 w-24 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
        <Skeleton className="h-4 w-52 mx-auto mt-6" />
      </div>
    </div>
  </div>
);

export { AuthSkeleton };

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      if (mode === "signup") {
        const normalizedEmail = email.trim().toLowerCase();
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { display_name: displayName || normalizedEmail.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setPendingVerificationEmail(normalizedEmail);
        toast({
          title: "Check your inbox",
          description: `We've sent a verification link to ${normalizedEmail}.`,
        });
      } else {
        const normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;

        // Check onboarding status
        if (data.user) {
          const { data: trust } = await supabase
            .from("user_trust")
            .select("onboarding_complete")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (trust?.onboarding_complete) {
            navigate("/lobby");
          } else {
            navigate("/onboarding");
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast({
        title: "Something went wrong",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingVerificationEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      toast({
        title: "Verification email resent",
        description: `A new verification link was sent to ${pendingVerificationEmail}.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to resend verification email";
      toast({
        title: "Resend failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="w-full max-w-md">
          <div className="text-center mb-10">
            <VerityLogo className="h-9 w-auto mx-auto mb-2" linkTo="/" />
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Welcome back." : "Join a community that values real connection."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <Input type="text" placeholder="Display name" value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)} className="h-12 bg-card border-border" />
              </motion.div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="Your email address" value={email}
                onChange={(e) => setEmail(e.target.value)} className="pl-11 h-12 bg-card border-border" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} className="pl-11 h-12 bg-card border-border" required minLength={6} />
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full group" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : mode === "login" ? (
                <><LogIn className="w-4 h-4 mr-2" /> Sign in</>
              ) : (
                <><UserPlus className="w-4 h-4 mr-2" /> Create account</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setPendingVerificationEmail(null);
            }}
              className="text-sm text-primary hover:text-primary/80 transition-colors">
              {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
          {mode === "signup" && pendingVerificationEmail && (
            <div className="mt-4 rounded-lg border border-border bg-card/40 p-4 text-left">
              <p className="text-sm text-foreground mb-2">
                Waiting for verification email?
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Check inbox, spam, and promotions for <span className="font-mono">{pendingVerificationEmail}</span>.
                If it still has not arrived, resend below.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleResendVerification}
                disabled={resending}
              >
                {resending ? "Resending..." : "Resend verification email"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground/40">
          By continuing, you agree to Verity's{" "}
          <Link to="/terms" className="underline hover:text-muted-foreground transition-colors">terms of service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="underline hover:text-muted-foreground transition-colors">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
