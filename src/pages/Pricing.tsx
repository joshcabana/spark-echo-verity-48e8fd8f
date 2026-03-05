import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to experience real chemistry.",
    features: [
      "Join scheduled Drops",
      "45-second anonymous video calls",
      "Spark / Pass with mutual reveal",
      "Text chat with mutual Sparks",
      "One-tap exit + report",
      "AI moderation protection",
    ],
    cta: "Get started",
    variant: "gold-outline" as const,
  },
  {
    name: "Verity Pass",
    price: "$14.99",
    period: "/month",
    description: "For those who want deeper connection and priority access.",
    features: [
      "Everything in Free",
      "Spark Reflection AI insights",
      "Chemistry Replay Vault",
      "Priority RSVP for Drops",
      "Access to premium rooms",
      "Advanced safety settings",
      "Guardian Net safety sharing",
    ],
    cta: "Get Verity Pass",
    variant: "gold" as const,
    highlighted: true,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing — Verity | Free & Verity Pass Plans</title>
        <meta
          name="description"
          content="Verity is free to use. Upgrade to Verity Pass for Spark Reflection AI, Chemistry Vault, priority RSVP, and premium rooms. Cancel anytime."
        />
        <link rel="canonical" href="https://getverity.com.au/pricing" />
        <meta property="og:title" content="Pricing — Verity | Free & Verity Pass Plans" />
        <meta property="og:description" content="Verity is free to use. Upgrade to Verity Pass for Spark Reflection AI, Chemistry Vault, priority RSVP, and premium rooms. Cancel anytime." />
        <meta property="og:url" content="https://getverity.com.au/pricing" />
        <meta property="og:image" content="https://getverity.com.au/og-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing — Verity | Free & Verity Pass Plans" />
        <meta name="twitter:description" content="Verity is free to use. Upgrade to Verity Pass for Spark Reflection AI, Chemistry Vault, priority RSVP, and premium rooms." />
        <meta name="twitter:image" content="https://getverity.com.au/og-logo.png" />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-xs tracking-luxury uppercase text-primary/60 mb-4 block">
              Pricing
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Simple, honest pricing.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real chemistry shouldn't cost a fortune. Start free, upgrade if
              you want more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`relative bg-card border rounded-lg p-8 ${
                  tier.highlighted
                    ? "border-primary/40 shadow-[0_0_30px_hsl(43_72%_55%/0.08)]"
                    : "border-border"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] tracking-luxury uppercase bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  </div>
                )}
                <h2 className="font-serif text-2xl text-foreground mb-1">
                  {tier.name}
                </h2>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-serif text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {tier.period}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block">
                  <Button
                    variant={tier.variant}
                    size="lg"
                    className="w-full group"
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground/60 mt-8">
            Cancel anytime. No lock-in contracts. Powered by Stripe.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
