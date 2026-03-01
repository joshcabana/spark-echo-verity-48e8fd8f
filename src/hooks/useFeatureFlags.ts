import { useQuery } from "@tanstack/react-query";
import { fetchFeatureFlags } from "@/lib/featureFlags";

export const useFeatureFlags = (enabled = true) => {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: fetchFeatureFlags,
    staleTime: 60_000,
    retry: 1,
    enabled,
  });
};
