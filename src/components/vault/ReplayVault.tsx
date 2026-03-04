import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ReplayCard from "./ReplayCard";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VaultItem {
  id: string;
  spark_id: string;
  status: string;
  duration_seconds: number;
  created_at: string;
  user_a: string;
  user_b: string;
  partner_name: string;
}

const ReplayVault = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const isSubscriber =
    !!profile &&
    profile.subscription_tier !== "free" &&
    !!profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  const { data: vaultItems = [] } = useQuery<VaultItem[]>({
    queryKey: ["chemistry-vault", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("chemistry_replays")
        .select("id, spark_id, status, duration_seconds, created_at, user_a, user_b")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch partner names
      const partnerIds = (data || []).map((r: Tables<"chemistry_replays">) =>
        r.user_a === user.id ? r.user_b : r.user_a
      );
      const uniqueIds = [...new Set(partnerIds)];
      const profileMap: Record<string, string> = {};

      if (uniqueIds.length > 0) {
        const results = await Promise.all(
          uniqueIds.map((uid) =>
            supabase.rpc("get_spark_partner_profile", { _partner_user_id: uid })
          )
        );
        results.forEach(({ data: profiles }) => {
          if (profiles) {
            profiles.forEach((p: { user_id: string; display_name: string | null }) => {
              profileMap[p.user_id] = p.display_name?.split(" ")[0] || "Spark";
            });
          }
        });
      }

      return (data || []).map((r: Tables<"chemistry_replays">) => {
        const partnerId = r.user_a === user.id ? r.user_b : r.user_a;
        return {
          id: r.id,
          spark_id: r.spark_id,
          status: r.status,
          duration_seconds: r.duration_seconds,
          created_at: r.created_at,
          user_a: r.user_a,
          user_b: r.user_b,
          partner_name: profileMap[partnerId] || `Spark ${r.id.slice(-4)}`,
        };
      });
    },
    enabled: !!user,
  });

  const handleView = (item: VaultItem) => {
    toast.info("Session insights: AI reflection and timestamps from your mutual Spark call.");
  };

  const handleUpgrade = () => {
    navigate("/tokens");
  };

  if (vaultItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-serif text-lg text-foreground mb-1">No vault entries yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Session notes and AI insights are captured from mutual-spark calls. Keep connecting!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isSubscriber && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Unlock your Chemistry Vault</p>
            <p className="text-xs text-muted-foreground">Verity Pass subscribers can view session notes and AI insights.</p>
          </div>
          <Button size="sm" onClick={handleUpgrade}>Upgrade</Button>
        </div>
      )}
      {vaultItems.map((item, i) => (
        <ReplayCard
          key={item.id}
          replay={item}
          index={i}
          isSubscriber={isSubscriber}
          onView={handleView}
          onUpgrade={handleUpgrade}
        />
      ))}
    </div>
  );
};

export default ReplayVault;
