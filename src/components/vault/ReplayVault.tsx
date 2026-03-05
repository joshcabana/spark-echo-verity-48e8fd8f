import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ReplayCard from "./ReplayCard";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VaultItem {
  id: string;
  call_id: string;
  title: string | null;
  user_notes: string | null;
  ai_reflection: string | null;
  feeling_score: number | null;
  created_at: string;
  partner_name: string;
}

interface ReflectionEntry {
  ai_reflection: string | null;
  feeling_score: number | null;
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

      // Query vault items with reflection data
      const { data, error } = await supabase
        .from("chemistry_vault_items")
        .select("id, call_id, title, user_notes, reflection_id, partner_user_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const items = data || [];

      // Get reflection data for items that have one
      const reflectionIds = items
        .map((i) => i.reflection_id)
        .filter(Boolean) as string[];

      const reflectionMap: Record<string, ReflectionEntry> = {};
      if (reflectionIds.length > 0) {
        const { data: reflections } = await supabase
          .from("spark_reflections")
          .select("id, ai_reflection, feeling_score")
          .in("id", reflectionIds);

        if (reflections) {
          reflections.forEach((r) => {
            reflectionMap[r.id] = {
              ai_reflection: r.ai_reflection,
              feeling_score: r.feeling_score,
            };
          });
        }
      }

      // Fetch partner names
      const partnerIds = [...new Set(items.map((i) => i.partner_user_id))];
      const profileMap: Record<string, string> = {};

      if (partnerIds.length > 0) {
        const results = await Promise.all(
          partnerIds.map((uid) =>
            supabase.rpc("get_spark_partner_profile", { _partner_user_id: uid })
          )
        );
        results.forEach(({ data: profiles }) => {
          if (profiles) {
            profiles.forEach((p) => {
              profileMap[p.user_id] = p.display_name?.split(" ")[0] || "Spark";
            });
          }
        });
      }

      return items.map((item) => {
        const ref = item.reflection_id ? reflectionMap[item.reflection_id] : null;
        return {
          id: item.id,
          call_id: item.call_id,
          title: item.title,
          user_notes: item.user_notes,
          ai_reflection: ref?.ai_reflection || null,
          feeling_score: ref?.feeling_score || null,
          created_at: item.created_at,
          partner_name: profileMap[item.partner_user_id] || "Spark",
        };
      });
    },
    enabled: !!user,
  });

  const handleView = (item: VaultItem) => {
    if (item.ai_reflection) {
      toast.info(item.ai_reflection, { duration: 8000 });
    } else {
      toast.info("No AI reflection available for this session.");
    }
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
          Session notes and AI insights are captured after each call. Keep connecting!
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
            <p className="text-xs text-muted-foreground">Verity Pass subscribers can view full AI insights.</p>
          </div>
          <Button size="sm" onClick={handleUpgrade}>Upgrade</Button>
        </div>
      )}
      {vaultItems.map((item, i) => (
        <ReplayCard
          key={item.id}
          item={item}
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
