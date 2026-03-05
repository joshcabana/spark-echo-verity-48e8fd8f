import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Shield, Sparkles, Users, Activity, Eye,
  BarChart3, Heart, ExternalLink, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const principles = [
  { title: "Privacy by design", text: "No call recordings are stored. Safety checks use call metadata and transcript snippets when available." },
  { title: "Radical fairness", text: "Every moderation decision can be appealed. Every appeal is reviewed by a human, not just an algorithm." },
  { title: "Transparent metrics", text: "We publish our safety and balance statistics in real time. We believe accountability builds trust." },
  { title: "No dark patterns", text: "No infinite scrolls, no addictive loops, no hidden fees. Verity is designed to help you connect, then step away." },
];

const chartConfig = {
  count: { label: "Percentage", color: "hsl(43 72% 55%)" },
};

const TransparencySkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-5">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-72 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto max-w-full" />
        </div>
        <div className="mb-16">
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="mb-16 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

const Transparency = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["transparency-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_stats")
        .select("*")
        .order("stat_date", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  if (isLoading) return <TransparencySkeleton />;

  const genderBalance = stats?.gender_balance as { men?: number; women?: number; nonbinary?: number } | null;

  const hasLiveStats = [
    stats?.total_sparks, stats?.active_users, stats?.total_calls, stats?.moderation_flags_count
  ].some((v) => (v ?? 0) > 0);

  const hasSafetyStats = [
    stats?.ai_accuracy, stats?.appeals_total, stats?.appeals_upheld, stats?.moderation_flags_count
  ].some((v) => (v ?? 0) > 0);

  const hasGenderData = [
    genderBalance?.women, genderBalance?.men, genderBalance?.nonbinary
  ].some((v) => (v ?? 0) > 0);

  const hasAnyStats = hasLiveStats || hasSafetyStats || hasGenderData;

  const liveStats = [
    { label: "Total sparks", value: String(stats?.total_sparks ?? 0), icon: Sparkles },
    { label: "Active users", value: String(stats?.active_users ?? 0), icon: Users },
    { label: "Total calls", value: String(stats?.total_calls ?? 0), icon: Activity },
    { label: "Moderation actions", value: String(stats?.moderation_flags_count ?? 0), icon: Shield },
  ];

  const safetyStats = [
    { label: "AI accuracy rate", value: `${stats?.ai_accuracy ?? 0}%`, detail: "Continuously improving with human review" },
    { label: "Appeals total", value: String(stats?.appeals_total ?? 0), detail: "Every appeal is reviewed" },
    { label: "Appeals upheld", value: String(stats?.appeals_upheld ?? 0), detail: "We listen and correct when wrong" },
    { label: "Moderation flags", value: String(stats?.moderation_flags_count ?? 0), detail: "Flags requiring review" },
  ];

  const genderData = [
    { gender: "Women", count: genderBalance?.women ?? 0 },
    { gender: "Men", count: genderBalance?.men ?? 0 },
    { gender: "Non-binary", count: genderBalance?.nonbinary ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Transparency — Verity | Radical Openness</title>
        <meta name="description" content="Verity's live transparency report: platform stats, safety metrics, AI accuracy, and gender balance — published in real time." />
        <link rel="canonical" href="https://getverity.com.au/transparency" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4 leading-tight">
              Verity operates with<br />
              <span className="text-gold-gradient">radical transparency</span>
            </h1>
            <p className="text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
              We believe trust is built through openness. Here is exactly how our platform performs.
            </p>
          </motion.div>

          {!hasAnyStats ? (
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <Activity className="w-5 h-5 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Stats will appear once our first Drop goes live.</p>
              </div>
            </motion.section>
          ) : (
            <>
              {hasLiveStats && (
                <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h2 className="text-xs uppercase tracking-luxury text-muted-foreground">Platform Stats</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {liveStats.map((stat, i) => (
                      <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }} className="rounded-lg border border-border bg-card p-5 text-center">
                        <stat.icon className="w-4 h-4 text-primary mx-auto mb-3" />
                        <p className="font-serif text-2xl text-foreground mb-1">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground/50">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {hasSafetyStats && (
                <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h2 className="font-serif text-xl text-foreground">Safety Report</h2>
                  </div>
                  <p className="text-sm text-muted-foreground/60 mb-6">Latest data</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {safetyStats.map((stat, i) => (
                      <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }} className="rounded-lg border border-border bg-card p-5">
                        <p className="text-xs text-muted-foreground/60 mb-1">{stat.label}</p>
                        <p className="font-serif text-2xl text-primary mb-2">{stat.value}</p>
                        <p className="text-xs text-muted-foreground/50 leading-relaxed">{stat.detail}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {hasGenderData && (
                <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <h2 className="font-serif text-xl text-foreground">Gender Balance</h2>
                  </div>
                  <p className="text-sm text-muted-foreground/60 mb-6">Current platform composition</p>
                  <div className="rounded-lg border border-border bg-card p-5">
                    <ChartContainer config={chartConfig} className="h-48 w-full">
                      <BarChart data={genderData} layout="vertical">
                        <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} domain={[0, 60]} unit="%" />
                        <YAxis type="category" dataKey="gender" tickLine={false} axisLine={false} fontSize={12} width={80} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="hsl(43 72% 55%)" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </motion.section>
              )}
            </>
          )}

          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-xl text-foreground">Founding Principles</h2>
            </div>
            <p className="text-sm text-muted-foreground/60 mb-6">The values that guide every decision we make</p>
            <div className="space-y-4">
              {principles.map((p, i) => (
                <motion.div key={p.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }} className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">{p.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="text-center pb-12">
            <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-8">
              <Eye className="w-5 h-5 text-primary mx-auto mb-3" />
              <h3 className="font-serif text-lg text-foreground mb-2">See the code behind our safety</h3>
              <p className="text-sm text-muted-foreground/60 mb-5 max-w-md mx-auto">
                Our moderation logic, privacy architecture, and data handling are documented publicly.
              </p>
              <Button variant="gold-outline" size="lg">
                <ExternalLink className="w-4 h-4 mr-2" />
                View safety documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Transparency;
