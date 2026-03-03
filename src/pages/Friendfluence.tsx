import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, UserPlus, Sparkles, Copy, Check, ArrowRight,
  Users, Calendar, Gift, Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Drop {
  id: string;
  title: string;
  scheduled_at: string;
  is_friendfluence: boolean;
  rooms: { name: string } | null;
}

interface TickerEvent {
  id: string;
  message: string;
  timestamp: number;
}

const Friendfluence = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const dropIdParam = searchParams.get("drop");
  const inviteCode = searchParams.get("code");

  const [drops, setDrops] = useState<Drop[]>([]);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(dropIdParam);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tickerEvents, setTickerEvents] = useState<TickerEvent[]>([]);
  const [friendEmail, setFriendEmail] = useState("");

  // SEO
  useEffect(() => {
    document.title = "Friendfluence • Bring a Friend to Verity";
  }, []);

  // Fetch upcoming friendfluence drops
  useEffect(() => {
    supabase
      .from("drops")
      .select("id, title, scheduled_at, is_friendfluence, rooms(name)")
      .eq("status", "upcoming")
      .order("scheduled_at", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (data) {
          const typed = data as unknown as Drop[];
          setDrops(typed);
          if (!selectedDropId && typed.length > 0) {
            setSelectedDropId(typed[0].id);
          }
        }
      });
  }, [selectedDropId]);

  // Realtime ticker on drop_rsvps
  useEffect(() => {
    const channel = supabase
      .channel("friendfluence-ticker")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "drop_rsvps",
        },
        (payload) => {
          if (payload.new?.friend_invite_code) {
            const evt: TickerEvent = {
              id: payload.new.id as string,
              message: "A friend just joined via invite!",
              timestamp: Date.now(),
            };
            setTickerEvents((prev) => [evt, ...prev].slice(0, 5));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const generateInvite = useCallback(async () => {
    if (!selectedDropId || !user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-friend-invite",
        { body: { drop_id: selectedDropId } }
      );
      if (error) throw error;
      setInviteUrl(data.invite_url);
      toast({ title: "Invite link ready!", description: "Share it with your friend." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }, [selectedDropId, user, toast]);

  const copyLink = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast({ title: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy", description: "Please copy the link manually.", variant: "destructive" });
    }
  }, [inviteUrl, toast]);

  const shareLink = useCallback(async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Verity!",
          text: "Real chemistry in 45 seconds. Join my Drop on Verity.",
          url: inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
  }, [inviteUrl, copyLink]);

  const selectedDrop = drops.find((d) => d.id === selectedDropId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </button>
          <span className="font-serif text-sm text-foreground">Verity</span>
        </div>
      </div>

      <div className="flex-1 py-12 px-6">
        <div className="max-w-sm mx-auto space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
              Bring a Friend · Get 2× Chemistry Score
            </h1>
            <p className="text-muted-foreground text-sm">
              Friends who Drop together spark faster. Share an invite and both of you get priority matching.
            </p>
          </motion.div>

          {/* Invite code banner */}
          {inviteCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-center"
            >
              <Gift className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-sm text-foreground font-medium">You were invited by a friend!</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll both get priority matching in this Drop.
              </p>
            </motion.div>
          )}

          {/* Drop selector */}
          {drops.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-medium text-foreground">Choose a Drop</h2>
              {drops.map((drop) => (
                <button
                  key={drop.id}
                  onClick={() => {
                    setSelectedDropId(drop.id);
                    setInviteUrl(null);
                    setCopied(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedDropId === drop.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {drop.rooms?.name && (
                    <span className="text-[10px] uppercase tracking-widest text-primary/80 block mb-1">
                      {drop.rooms.name}
                      {drop.is_friendfluence && " · Friendfluence"}
                    </span>
                  )}
                  <p className="text-sm font-medium text-foreground">{drop.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(drop.scheduled_at), "EEE d MMM · h:mm a")}
                  </p>
                </button>
              ))}
            </motion.div>
          )}

          {/* Generate & share */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {!inviteUrl ? (
              <Button
                variant="gold"
                size="lg"
                onClick={generateInvite}
                disabled={generating || !selectedDropId}
                className="w-full"
              >
                {generating ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Generate Invite Link
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={inviteUrl}
                    readOnly
                    className="h-12 bg-card border-border text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="h-12 w-12 flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="gold" size="lg" onClick={shareLink} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" /> Share with a Friend
                </Button>
              </div>
            )}

            {/* Email share helper */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Or paste their email — we'll remind you to share
              </p>
              <Input
                type="email"
                placeholder="friend@example.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="h-12 bg-card border-border"
              />
            </div>
          </motion.div>

          {/* Live ticker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Live Activity</h3>
            </div>
            <div className="space-y-2 min-h-[60px]">
              <AnimatePresence mode="popLayout">
                {tickerEvents.length > 0 ? (
                  tickerEvents.map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border"
                    >
                      <Star className="w-3 h-3 text-primary flex-shrink-0" />
                      <p className="text-xs text-foreground">{evt.message}</p>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground text-center py-4"
                  >
                    Waiting for friends to join…
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Reward preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-primary/20">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Mutual Spark Reward</p>
                    <p className="text-xs text-muted-foreground">
                      Both get Verity Pass credit when you spark together
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: Shield, label: "Privacy-first" },
                    { icon: UserPlus, label: "2× Priority" },
                    { icon: Sparkles, label: "Pass credit" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="text-center p-2 rounded-lg bg-secondary/50">
                      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy note */}
          <p className="text-[10px] text-muted-foreground/50 text-center">
            Your friend never sees your identity until a mutual Spark.
            AU Privacy Act compliant.
          </p>

          {/* CTA to lobby */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/lobby")}
            className="w-full"
          >
            Go to Lobby <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Friendfluence;
