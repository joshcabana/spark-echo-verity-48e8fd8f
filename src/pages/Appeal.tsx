import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, Send, Mic, Clock,
  Check, X, FileText, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ModerationFlag {
  id: string;
  reason: string | null;
  ai_confidence: number | null;
  created_at: string;
}

interface PastAppeal {
  id: string;
  explanation: string;
  status: "pending" | "upheld" | "denied";
  created_at: string;
  admin_response: string | null;
  flag_id: string | null;
}

const Appeal = () => {
  const { user } = useAuth();
  const [explanation, setExplanation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pendingFlag, setPendingFlag] = useState<ModerationFlag | null>(null);
  const [pastAppeals, setPastAppeals] = useState<PastAppeal[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch pending flags via restricted view (excludes clip_url)
      const { data: flags } = await supabase
        .from("my_moderation_flags" as any)
        .select("id, reason, ai_confidence, created_at")
        .is("action_taken", null)
        .order("created_at", { ascending: false })
        .limit(1) as { data: Array<{ id: string; reason: string | null; ai_confidence: number | null; created_at: string }> | null };

      // Check if any of these flags already have an appeal
      if (flags && flags.length > 0) {
        const { data: existingAppeal } = await supabase
          .from("appeals")
          .select("id")
          .eq("flag_id", flags[0].id)
          .limit(1);

        if (!existingAppeal || existingAppeal.length === 0) {
          setPendingFlag(flags[0]);
        }
      }

      // Fetch past appeals
      const { data: appeals } = await supabase
        .from("appeals")
        .select("id, explanation, status, created_at, admin_response, flag_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPastAppeals((appeals as PastAppeal[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSubmit = async () => {
    if (!explanation.trim() || !user || !pendingFlag) return;
    setSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await supabase.functions.invoke("submit-appeal", {
        body: {
          explanation: explanation.trim(),
          flag_id: pendingFlag.id,
          voice_note_url: null,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.error) throw res.error;

      setSubmitted(true);
      setPendingFlag(null);
      toast.success("Appeal submitted successfully");
    } catch (err) {
      console.error("Appeal submission error:", err);
      toast.error("Failed to submit appeal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-2xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <span className="font-serif text-lg text-foreground">Appeals</span>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-5 py-8">
        <AnimatePresence mode="wait">
          {/* ═══ ACTIVE FLAG — SUBMIT FORM ═══ */}
          {pendingFlag && !submitted && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* Flag notice */}
              <div className="rounded-lg border border-destructive/20 bg-destructive/[0.04] p-5 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-serif text-lg text-foreground mb-1">You were flagged</h2>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">
                      Our AI moderation detected potentially inappropriate content during your recent call.
                      This is a preliminary flag — your account remains active while we review.
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-3">
                      Reason: {pendingFlag.reason || "Unspecified"}
                      {pendingFlag.ai_confidence != null && ` (AI confidence: ${Math.round(pendingFlag.ai_confidence)}%)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appeal form */}
              <div className="mb-8">
                <h3 className="font-serif text-xl text-foreground mb-2">Share your side</h3>
                <p className="text-sm text-muted-foreground/60 mb-5 leading-relaxed">
                  We value fairness above all else. Please describe what happened in your own words.
                  Every appeal is reviewed carefully by a real person.
                </p>

                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Please explain what happened during the call…"
                  rows={5}
                  className="mb-4 resize-none"
                />

                {/* Voice note */}
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="gap-2"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Voice note (coming soon)
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Submit written context for now.
                  </span>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!explanation.trim() || submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {submitting ? "Submitting…" : "Submit appeal"}
                </Button>

                <p className="text-[11px] text-muted-foreground/35 text-center mt-3">
                  Appeals are typically reviewed within 24 hours.
                </p>
              </div>
            </motion.div>
          )}

          {/* ═══ SUBMISSION CONFIRMATION ═══ */}
          {submitted && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-2">Appeal received</h2>
              <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto leading-relaxed mb-6">
                Thank you for sharing your perspective. A member of our team will review your appeal
                carefully and respond within 24 hours.
              </p>
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                <Clock className="w-3 h-3 mr-1" />
                Under review
              </Badge>
            </motion.div>
          )}

          {/* ═══ NO PENDING FLAGS ═══ */}
          {!pendingFlag && !submitted && (
            <motion.div
              key="no-flag"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-2">All clear</h2>
              <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto leading-relaxed">
                You have no pending flags on your account. If you are flagged in the future,
                you'll be able to submit an appeal here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ PAST APPEALS ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h3 className="font-serif text-lg text-foreground mb-1">Appeal history</h3>
          <p className="text-xs text-muted-foreground/50 mb-5">Your previous appeals and their outcomes</p>

          {pastAppeals.length === 0 ? (
            <p className="text-sm text-muted-foreground/40 text-center py-8">
              No previous appeals on your account.
            </p>
          ) : (
            <div className="space-y-3">
              {pastAppeals.map((appeal, i) => (
                <motion.div
                  key={appeal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-sm text-foreground/80">{appeal.explanation}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] flex-shrink-0 ${
                        appeal.status === "upheld"
                          ? "text-primary border-primary/30"
                          : appeal.status === "denied"
                          ? "text-destructive border-destructive/30"
                          : "text-muted-foreground border-border"
                      }`}
                    >
                      {appeal.status === "upheld" ? (
                        <><Check className="w-2.5 h-2.5 mr-1" /> Upheld</>
                      ) : appeal.status === "denied" ? (
                        <><X className="w-2.5 h-2.5 mr-1" /> Denied</>
                      ) : (
                        <><Clock className="w-2.5 h-2.5 mr-1" /> Pending</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/50 mb-2">{formatDate(appeal.created_at)}</p>
                  {appeal.admin_response && (
                    <p className="text-xs text-muted-foreground/60 leading-relaxed italic">
                      "{appeal.admin_response}"
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default Appeal;
