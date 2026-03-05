import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  UserCheck,
  Bot,
  LogOut,
  Ban,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const safetyPoints = [
  {
    icon: Eye,
    title: "No recordings — ever",
    description:
      "Video and audio are live-only. Nothing is recorded, stored, or replayed. When the call ends, it's gone. Our Chemistry Replay Vault stores only text-based session notes and AI insights.",
  },
  {
    icon: Shield,
    title: "Mutual consent reveal",
    description:
      "Your identity is never revealed unless both people independently choose Spark. The server enforces this — it cannot be bypassed from the client. If there's no mutual Spark, there's no trace.",
  },
  {
    icon: UserCheck,
    title: "18+ verification required",
    description:
      "Every user must complete age verification before joining any Drop. We store your verification status — never your identity documents.",
  },
  {
    icon: Bot,
    title: "AI moderation with human appeal",
    description:
      "Our AI moderation system monitors live sessions for policy violations. If action is taken, you always have the right to appeal to a human reviewer.",
  },
  {
    icon: LogOut,
    title: "One-tap exit + report",
    description:
      "You can leave any call instantly with a single tap. Report functionality is always one tap away — no friction, no guilt. Your safety comes first.",
  },
  {
    icon: Ban,
    title: "Zero tolerance policy",
    description:
      "Harassment, abuse, and inappropriate behaviour result in immediate suspension. We review every report and take action swiftly.",
  },
  {
    icon: Users,
    title: "Guardian Net safety sharing",
    description:
      "Optionally share your Drop window status with up to three trusted contacts. They'll know you're in a session — without seeing any match details.",
  },
];

const Safety = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Safety Promise — Verity | Built for Safety, Not Virality</title>
        <meta
          name="description"
          content="Verity's safety promise: no recordings, mutual consent reveal, 18+ verification, AI moderation, one-tap exit, and zero tolerance for abuse."
        />
        <link rel="canonical" href="https://getverity.com.au/safety" />
        <meta property="og:title" content="Safety Promise — Verity | Built for Safety, Not Virality" />
        <meta property="og:description" content="Verity's safety promise: no recordings, mutual consent reveal, 18+ verification, AI moderation, one-tap exit, and zero tolerance for abuse." />
        <meta property="og:url" content="https://getverity.com.au/safety" />
        <meta property="og:image" content="https://getverity.com.au/og-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Safety Promise — Verity | Built for Safety, Not Virality" />
        <meta name="twitter:description" content="Verity's safety promise: no recordings, mutual consent reveal, 18+ verification, AI moderation, one-tap exit, and zero tolerance for abuse." />
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
              Our promise
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Built for safety — not virality.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every design decision at Verity starts with one question: does
              this protect the person on the other side of the screen?
            </p>
          </motion.div>

          <div className="space-y-6">
            {safetyPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-5 bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-foreground mb-2">
                    {point.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16"
          >
            <Link to="/transparency">
              <Button variant="gold-outline" size="lg">
                View transparency report
              </Button>
            </Link>
            <Link to="/privacy">
              <Button variant="ghost" size="lg">
                Read privacy policy
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Safety;
