import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, User, RefreshCw } from "lucide-react";
import VerityLogo from "@/components/VerityLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthCapabilities } from "@/hooks/useAuthCapabilities";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import DropCard from "@/components/lobby/DropCard";
import DropsFilter, { type FilterOption } from "@/components/lobby/DropsFilter";
import MatchmakingOverlay from "@/components/lobby/MatchmakingOverlay";
import BottomNav from "@/components/BottomNav";
import { isToday, isThisWeek } from "date-fns";
import { toast } from "sonner";

interface Drop {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  max_capacity: number;
  status: string;
  room_id: string;
  rooms?: { name: string } | null;
  is_friendfluence: boolean;
}

const Lobby = () => {
  const { user, userTrust } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: authCapabilities } = useAuthCapabilities();
  const { data: featureFlags } = useFeatureFlags();
  const requirePhoneVerificationEnabled = featureFlags?.requirePhoneVerification ?? true;
  const [filter, setFilter] = useState<FilterOption>("all");
  const [matchmaking, setMatchmaking] = useState<{
    active: boolean;
    roomName: string;
    dropTitle: string;
    dropId: string;
  }>({ active: false, roomName: "", dropTitle: "", dropId: "" });

  const strictPhoneProviderBlocked = requirePhoneVerificationEnabled && authCapabilities?.phoneEnabled === false;
  const fallbackPhoneModeActive = !requirePhoneVerificationEnabled && authCapabilities?.phoneEnabled === false;

  const trustComplete = !!(
    (!requirePhoneVerificationEnabled || userTrust?.phone_verified) &&
    userTrust?.selfie_verified &&
    userTrust?.safety_pledge_accepted
  );

  // Fetch drops
  const { data: drops = [] } = useQuery<Drop[]>({
    queryKey: ["drops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drops")
        .select("*, rooms(name)")
        .in("status", ["upcoming", "live"])
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data as Drop[];
    },
  });

  // Fetch user RSVPs
  const { data: rsvps = [] } = useQuery({
    queryKey: ["my-rsvps", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("drop_rsvps")
        .select("drop_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((r) => r.drop_id);
    },
    enabled: !!user,
  });

  // Fetch RSVP counts
  const { data: rsvpCounts = {} } = useQuery({
    queryKey: ["rsvp-counts", drops.map((d) => d.id).join(",")],
    queryFn: async () => {
      if (drops.length === 0) return {};
      const dropIds = drops.map((d) => d.id);
      const { data, error } = await supabase
        .from("drop_rsvps")
        .select("drop_id")
        .in("drop_id", dropIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const id of dropIds) counts[id] = 0;
      for (const row of data ?? []) counts[row.drop_id] = (counts[row.drop_id] || 0) + 1;
      return counts;
    },
    enabled: drops.length > 0,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (dropId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("drop_rsvps")
        .insert({ drop_id: dropId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rsvps"] });
      queryClient.invalidateQueries({ queryKey: ["rsvp-counts"] });
    },
  });

  // Cancel RSVP mutation
  const cancelMutation = useMutation({
    mutationFn: async (dropId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("drop_rsvps")
        .delete()
        .eq("drop_id", dropId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rsvps"] });
      queryClient.invalidateQueries({ queryKey: ["rsvp-counts"] });
    },
  });

  // Matchmaking polling refs
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRetryRef = useRef(0);
  const pollDropRef = useRef<{ drop_id: string; room_id: string } | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollRetryRef.current = 0;
    pollDropRef.current = null;
  }, []);

  // Clean up polling on unmount or when matchmaking becomes inactive
  useEffect(() => {
    if (!matchmaking.active) stopPolling();
    return () => stopPolling();
  }, [matchmaking.active, stopPolling]);

  // Join live drop
  const handleJoin = useCallback(async (drop: Drop) => {
    if (!user) return;

    if (strictPhoneProviderBlocked) {
      toast.error("Phone verification provider is unavailable. Please try again shortly.");
      return;
    }

    if (!trustComplete) {
      if (requirePhoneVerificationEnabled) {
        toast.error("Complete phone, selfie, and safety pledge verification to join live Drops.");
      } else {
        toast.error("Complete selfie and safety pledge verification to join live Drops.");
      }
      return;
    }

    setMatchmaking({
      active: true,
      roomName: drop.rooms?.name || "Drop",
      dropTitle: drop.title,
      dropId: drop.id,
    });

    try {
      const { data, error } = await supabase.functions.invoke("find-match", {
        body: { drop_id: drop.id, room_id: drop.room_id },
      });

      if (error) throw error;

      if (data.status === "matched") {
        setMatchmaking((m) => ({ ...m, active: false }));
        navigate(`/call/${data.call_id}?channel=${encodeURIComponent(data.agora_channel)}`);
      } else {
        // Queued — start polling every 4s, max 10 retries
        pollRetryRef.current = 0;
        pollDropRef.current = { drop_id: drop.id, room_id: drop.room_id };
        pollIntervalRef.current = setInterval(async () => {
          pollRetryRef.current += 1;
          if (pollRetryRef.current > 10) {
            stopPolling();
            setMatchmaking((m) => ({ ...m, active: false }));
            toast.error("No match found this time. Try again when the Drop is live.");
            return;
          }
          try {
            const { data: pollData, error: pollErr } = await supabase.functions.invoke("find-match", {
              body: pollDropRef.current,
            });
            if (pollErr) return;
            if (pollData?.status === "matched") {
              stopPolling();
              setMatchmaking((m) => ({ ...m, active: false }));
              navigate(`/call/${pollData.call_id}?channel=${encodeURIComponent(pollData.agora_channel)}`);
            }
          } catch {
            // Silent — retry next interval
          }
        }, 4000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to join drop";
      toast.error(message);
      setMatchmaking((m) => ({ ...m, active: false }));
    }
  }, [user, trustComplete, navigate, stopPolling, strictPhoneProviderBlocked, requirePhoneVerificationEnabled]);

  // Realtime for drops/RSVPs
  useEffect(() => {
    const channel = supabase
      .channel("drops-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "drops" }, () => {
        queryClient.invalidateQueries({ queryKey: ["drops"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "drop_rsvps" }, () => {
        queryClient.invalidateQueries({ queryKey: ["rsvp-counts"] });
        queryClient.invalidateQueries({ queryKey: ["my-rsvps"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Filter drops
  const filtered = drops.filter((d) => {
    if (filter === "today") return isToday(new Date(d.scheduled_at));
    if (filter === "week") return isThisWeek(new Date(d.scheduled_at));
    if (filter === "my-rsvps") return rsvps.includes(d.id);
    return true;
  });

  const nextRsvp = drops.find((d) => rsvps.includes(d.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VerityLogo variant="icon" className="h-7 w-7" linkTo="/" />
            <div className="flex items-center gap-1 ml-3 text-[10px] text-muted-foreground/60">
              <Shield className="w-3 h-3 text-primary/50" />
              <span>Safety first</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <User className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-5 pt-8">
        {strictPhoneProviderBlocked && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Live Drops are temporarily paused because phone verification is required but the SMS provider is offline.
          </div>
        )}
        {fallbackPhoneModeActive && (
          <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            Continuity mode is active: phone verification is temporarily optional while the SMS provider is offline.
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">Upcoming Drops</h1>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["drops"] })}
              className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              aria-label="Refresh drops"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground/60 mb-1">Verified 18+ Speed Dating Drops</p>
          <p className="text-muted-foreground max-w-lg leading-relaxed text-sm">
            Scheduled sessions by room. RSVP to reserve your spot — you'll be matched when the Drop goes live.
          </p>
        </motion.div>

        <div className="mb-6">
          <DropsFilter active={filter} onChange={setFilter} />
        </div>

        {nextRsvp && filter !== "my-rsvps" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl border border-primary/20 bg-primary/5">
            <span className="text-[10px] uppercase tracking-luxury text-primary block mb-1">Your next Drop</span>
            <p className="font-serif text-foreground">{nextRsvp.title}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          {filtered.map((drop, i) => (
            <DropCard
              key={drop.id}
              drop={drop}
              rsvpCount={(rsvpCounts as Record<string, number>)[drop.id] ?? 0}
              isRsvpd={rsvps.includes(drop.id)}
              onRsvp={(id) => rsvpMutation.mutate(id)}
              onCancel={(id) => cancelMutation.mutate(id)}
              onJoin={handleJoin}
              trustComplete={trustComplete}
              index={i}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-16 text-sm">
            {filter === "my-rsvps" ? "You haven't RSVP'd to any Drops yet." : "No Drops scheduled — check back soon."}
          </motion.p>
        )}

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
          className="mt-10 mb-6 text-center text-[11px] text-muted-foreground/40 leading-relaxed">
          All calls are anonymous · Safety first · Nothing is stored
        </motion.p>
      </main>

      <BottomNav activeTab="go-live" />

      <MatchmakingOverlay
        open={matchmaking.active}
        roomName={matchmaking.roomName}
        dropTitle={matchmaking.dropTitle}
        dropId={matchmaking.dropId}
        onCancel={() => setMatchmaking({ active: false, roomName: "", dropTitle: "", dropId: "" })}
      />
    </div>
  );
};

export default Lobby;
