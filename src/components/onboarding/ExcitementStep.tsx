import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Shield, Eye, UserCheck, Sparkles } from "lucide-react";
import { useAgoraCall } from "@/hooks/useAgoraCall";
import { supabase } from "@/integrations/supabase/client";
import SparkPassButtons from "@/components/call/SparkPassButtons";

interface ExcitementStepProps {
  onNext: () => void;
}

const TRUST_BULLETS = [
  { icon: Eye, label: "Anonymous until mutual spark", desc: "Neither person sees names or photos until both say yes." },
  { icon: Shield, label: "Nothing stored if no connection", desc: "No match? No trace. Your dignity is non-negotiable." },
  { icon: UserCheck, label: "Verified 18+ members only", desc: "Every member is ID-verified. No bots. No catfish." },
];

const FULL_DURATION = 45;
const TEST_DURATION = 5;

interface AgoraTokenResponse {
  token: string;
  appId: string;
  uid: number;
  channel: string;
}

const ExcitementStep = ({ onNext }: ExcitementStepProps) => {
  const [testMode, setTestMode] = useState(false);
  const demoDuration = testMode ? TEST_DURATION : FULL_DURATION;

  // Demo state machine: idle → loading → agora | simulated → choice → reveal → done
  const [phase, setPhase] = useState<"idle" | "loading" | "agora" | "simulated" | "choice" | "reveal">("idle");
  const [countdown, setCountdown] = useState(demoDuration);
  const [demoComplete, setDemoComplete] = useState(false);

  // Agora credentials
  const [agoraConfig, setAgoraConfig] = useState<AgoraTokenResponse | null>(null);
  const agoraEnabled = phase === "agora" && !!agoraConfig;

  const {
    localVideoRef,
    isJoined,
    error: agoraError,
    leave,
  } = useAgoraCall({
    appId: agoraConfig?.appId ?? "",
    channel: agoraConfig?.channel ?? "",
    token: agoraConfig?.token ?? null,
    uid: agoraConfig?.uid ?? 0,
    enabled: agoraEnabled,
  });

  // If agora errors after joining, fall back to simulated
  useEffect(() => {
    if (agoraError && phase === "agora") {
      console.warn("Agora error, falling back to simulated demo:", agoraError);
      leave();
      setPhase("simulated");
      setCountdown(demoDuration);
    }
  }, [agoraError, phase, leave, demoDuration]);

  // Countdown timer for both agora and simulated phases
  useEffect(() => {
    if (phase !== "agora" && phase !== "simulated") return;
    if (countdown <= 0) return;

    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, countdown]);

  // When countdown hits 0, transition to choice
  useEffect(() => {
    if (countdown === 0 && (phase === "agora" || phase === "simulated")) {
      console.log("DEMO_ENDED");
      if (phase === "agora") leave();
      setPhase("choice");
    }
  }, [countdown, phase, leave]);

  const startDemo = useCallback(async () => {
    console.log("AGORA_DEMO_START");
    setPhase("loading");
    setCountdown(demoDuration);

    try {
      const { data, error } = await supabase.functions.invoke("agora-demo-token", {
        method: "POST",
      });

      if (error || !data?.token) {
        throw new Error(error?.message ?? "No token returned");
      }

      console.log("AGORA_TOKEN_GENERATED");
      setAgoraConfig(data as AgoraTokenResponse);
      setPhase("agora");
    } catch (err) {
      console.warn("Token fetch failed, using simulated demo:", err);
      setPhase("simulated");
    }
  }, [demoDuration]);

  const skipDemo = useCallback(() => {
    console.log("DEMO_ENDED");
    if (phase === "agora") leave();
    setPhase("choice");
    setCountdown(0);
  }, [phase, leave]);

  const handleChoice = useCallback((choice: "spark" | "pass") => {
    console.log(choice === "spark" ? "SPARK_SELECTED" : "PASS_SELECTED");
    setPhase("reveal");
    setTimeout(() => {
      setDemoComplete(true);
      setPhase("idle");
    }, 2000);
  }, []);

  const isOverlayActive = phase === "loading" || phase === "agora" || phase === "simulated" || phase === "choice" || phase === "reveal";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center px-6 max-w-lg mx-auto w-full"
    >
      {/* Dev test mode toggle */}
      {import.meta.env.DEV && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2 text-xs">
          <span className="text-muted-foreground">Test (5s)</span>
          <Switch checked={testMode} onCheckedChange={setTestMode} />
        </div>
      )}

      {/* Badge */}
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-block text-xs tracking-luxury uppercase text-primary/80 border border-primary/20 px-4 py-2 rounded-full mb-8"
      >
        Verified 18+ speed dating
      </motion.span>

      {/* Headline */}
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-4 text-foreground">
        Real chemistry in{" "}
        <span className="text-gold-gradient italic">45 seconds.</span>
      </h1>

      <p className="text-muted-foreground max-w-md mb-10 text-sm sm:text-base leading-relaxed font-light">
        No endless swiping. No rejection notifications. Just mutual spark.
      </p>

      {/* Trust bullets */}
      <div className="grid gap-3 w-full mb-10">
        {TRUST_BULLETS.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border text-left"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <b.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{b.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Demo overlay */}
      <AnimatePresence>
        {isOverlayActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center px-6"
          >
            {/* Loading state */}
            {phase === "loading" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                <p className="text-sm text-muted-foreground">Preparing your demo…</p>
              </motion.div>
            )}

            {/* Agora live video */}
            {phase === "agora" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full max-w-sm">
                <p className="text-xs tracking-luxury uppercase text-primary/80 mb-3">Live camera preview</p>
                <p className="font-serif text-2xl text-foreground mb-4">Anonymous until mutual spark</p>

                {/* Local video container */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border/40 bg-secondary/20 mb-6">
                  <div ref={localVideoRef} className="absolute inset-0" />
                  {!isJoined && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <CountdownRing countdown={countdown} total={demoDuration} />

                <Button variant="ghost" size="sm" onClick={skipDemo} className="mt-4 text-muted-foreground">
                  Skip demo
                </Button>
              </motion.div>
            )}

            {/* Simulated fallback */}
            {phase === "simulated" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-32 h-32 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center mb-8"
                >
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Eye className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </motion.div>

                <p className="text-xs tracking-luxury uppercase text-primary/80 mb-3">Simulated demo</p>
                <p className="font-serif text-2xl text-foreground mb-2">Anonymous until mutual spark</p>

                <CountdownRing countdown={countdown} total={demoDuration} />

                <p className="text-sm text-muted-foreground max-w-xs mt-6 mb-6">
                  In a real Drop, you'd see your match's silhouette — voice only for the first 10 seconds, then video reveals.
                </p>

                <Button variant="ghost" size="sm" onClick={skipDemo} className="text-muted-foreground">
                  Skip demo
                </Button>
              </motion.div>
            )}

            {/* Choice phase — Spark / Pass */}
            {phase === "choice" && (
              <SparkPassButtons onChoice={handleChoice} elapsed={FULL_DURATION} />
            )}

            {/* Reveal animation */}
            {phase === "reveal" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-6xl mb-6"
                >
                  ✨
                </motion.div>
                <p className="font-serif text-2xl text-foreground mb-2">It's a mutual spark!</p>
                <p className="text-sm text-muted-foreground">No ego damage. Ever.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="w-full max-w-sm space-y-3">
        {!demoComplete ? (
          <Button
            variant="gold"
            size="lg"
            onClick={startDemo}
            disabled={phase === "loading"}
            className="w-full group"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Watch {testMode ? "5" : "45"}-second demo
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-primary font-medium mb-4">
              ✨ That's how fast real chemistry happens.
            </p>
            <Button variant="gold" size="lg" onClick={onNext} className="w-full group">
              Continue
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        )}

        {!demoComplete && (
          <button
            onClick={onNext}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip intro →
          </button>
        )}
      </div>

      <p className="mt-12 text-[10px] text-muted-foreground/50 tracking-luxury uppercase">
        Mutual spark only · Dignity always
      </p>
    </motion.div>
  );
};

/** Reusable countdown ring */
function CountdownRing({ countdown, total }: { countdown: number; total: number }) {
  const circumference = 2 * Math.PI * 45;
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (countdown / total)}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-foreground">
        {countdown}
      </span>
    </div>
  );
}

export default ExcitementStep;
