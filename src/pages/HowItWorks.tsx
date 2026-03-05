import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, Video, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const steps = [
  {
    icon: CalendarCheck,
    step: "01",
    title: "RSVP to a Drop",
    description:
      "Choose a themed, scheduled session that fits your energy — Night Owls, Creatives, Over 35, and more. Drops happen at set times, so there's no endless browsing.",
    detail: "Each Drop has limited spots and a clear start time. No infinite scroll, no swiping — just a calm, intentional decision to show up.",
  },
  {
    icon: Video,
    step: "02",
    title: "Join the 45-second anonymous video call",
    description:
      "No profiles, no photos. Just real eyes and voice with a stranger for 45 seconds. Your video is anonymised at the track level — the other person never receives your raw camera feed.",
    detail: "We use canvas-processed video to ensure true anonymity. DevTools can't bypass it. Your identity is protected until you both choose otherwise.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Both choose Spark or Pass",
    description:
      "Independently and privately. No rejection notifications — ever. Zero ego damage by design.",
    detail: "Neither person ever learns the other's choice unless it's mutual. The server resolves decisions privately. If there's no Spark, there's no trace.",
  },
  {
    icon: MessageCircle,
    step: "04",
    title: "Mutual Sparks unlock chat",
    description:
      "Only when both choose Spark do identities reveal. Then voice intros and text chat open up.",
    detail: "Identity reveal is server-enforced and cannot be bypassed. You'll see their name, verified badge, and can start chatting immediately.",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How It Works — Verity | Anonymous Speed Dating</title>
        <meta
          name="description"
          content="Four steps to real chemistry. RSVP to a themed Drop, join a 45-second anonymous video call, choose Spark or Pass, and connect if it's mutual."
        />
        <link rel="canonical" href="https://getverity.com.au/how-it-works" />
        <meta property="og:title" content="How It Works — Verity | Anonymous Speed Dating" />
        <meta property="og:description" content="Four steps to real chemistry. RSVP to a themed Drop, join a 45-second anonymous video call, choose Spark or Pass, and connect if it's mutual." />
        <meta property="og:url" content="https://getverity.com.au/how-it-works" />
        <meta property="og:image" content="https://getverity.com.au/og-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How It Works — Verity | Anonymous Speed Dating" />
        <meta name="twitter:description" content="Four steps to real chemistry. RSVP to a themed Drop, join a 45-second anonymous video call, choose Spark or Pass, and connect if it's mutual." />
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
              How it works
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Four steps. No games.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Verity is intentionally simple. No algorithms, no profiles, no
              swiping. Just scheduled moments of real human connection.
            </p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative bg-card border border-border rounded-lg p-8 hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-serif text-primary">
                      {item.step}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <item.icon className="w-5 h-5 text-primary/60" />
                      <h2 className="font-serif text-xl text-foreground">
                        {item.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      {item.description}
                    </p>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <Link to="/auth">
              <Button variant="gold" size="xl" className="group">
                RSVP for the next Drop
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground/60 tracking-luxury uppercase">
              Verified 18+ · Anonymous until mutual Spark
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
