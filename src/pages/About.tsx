import { Helmet } from "react-helmet-async";
import { Heart, Shield, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About — Verity | Built in Australia</title>
        <meta name="description" content="Verity is built by a solo Australian developer. No venture capital, no dark patterns — just a genuine attempt to fix how people meet." />
        <link rel="canonical" href="https://getverity.com.au/about" />
        <meta property="og:title" content="About — Verity | Built in Australia" />
        <meta property="og:description" content="Verity is built by a solo Australian developer. No venture capital, no dark patterns — just a genuine attempt to fix how people meet." />
        <meta property="og:url" content="https://getverity.com.au/about" />
        <meta property="og:image" content="https://getverity.com.au/og-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About — Verity | Built in Australia" />
        <meta name="twitter:description" content="Verity is built by a solo Australian developer. No venture capital, no dark patterns — just a genuine attempt to fix how people meet." />
        <meta name="twitter:image" content="https://getverity.com.au/og-logo.png" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-3xl mx-auto px-6">
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            About Verity
          </h1>
          <p className="text-muted-foreground/70 text-lg mb-12">
            Built by a solo Australian developer in Canberra, 2026.
          </p>

          {/* Why */}
          <section className="mb-12">
            <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Why Verity exists
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                78% of dating-app users report burnout. 80% of women experience dating fatigue. 
                Ghosting accounts for 41% of that fatigue. The swipe economy is broken — it optimises 
                for engagement, not connection.
              </p>
              <p>
                Verity is the opposite: real eyes, real voice, 45 seconds, and dignity always. 
                No infinite scroll, no streaks, no dopamine loops. If there's no spark, there's no 
                trace. If there is — both people chose it.
              </p>
            </div>
          </section>

          {/* Principles */}
          <section className="mb-12">
            <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Founding principles
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✦</span>
                <span><strong className="text-foreground">Mutual consent only.</strong> Both people choose Spark independently. No rejection signals are ever sent.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✦</span>
                <span><strong className="text-foreground">Privacy by default.</strong> Anonymous until mutual spark. Raw call video is never stored.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✦</span>
                <span><strong className="text-foreground">Safety first.</strong> 18+ verification, AI moderation, and one-tap Guardian Net safety alerts.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✦</span>
                <span><strong className="text-foreground">Radical transparency.</strong> Live safety stats, moderation accuracy, and gender balance published publicly.</span>
              </li>
            </ul>
          </section>

          {/* Solo founder */}
          <section className="mb-12">
            <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              The team
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              There is no team page — this is a one-person project built with conviction. 
              Verity is designed, developed, and operated by a solo founder in Australia. 
              No venture capital, no growth-hacking, no dark patterns. Just a genuine attempt 
              to fix how people meet.
            </p>
          </section>

          <div className="pt-6 border-t border-border/30 flex items-center gap-4">
            <span className="text-xs text-muted-foreground/60">🇦🇺 Australian Built</span>
            <span className="text-xs text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground/60">18+ verified · Nothing stored until mutual Spark</span>
          </div>

          <div className="mt-8">
            <Link to="/onboarding">
              <Button variant="gold-outline" size="sm">Get verified</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
