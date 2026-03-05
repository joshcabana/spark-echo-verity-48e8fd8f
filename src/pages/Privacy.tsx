import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const sections = [
  {
    title: "Data We Collect",
    content:
      "We collect the minimum data needed to operate Verity: your email address, age confirmation, selfie for verification, and optional profile information (display name, city, gender). During calls, we process transcript snippets and call metadata for safety checks — no raw video is stored.",
  },
  {
    title: "How We Use Your Data",
    content:
      "Your data is used to verify your identity, match you during Drops, run live safety checks, and improve our moderation systems. We never sell your data. We never share your identity with another user unless you both choose Spark.",
  },
  {
    title: "Data Storage & Retention",
    content:
      "Data is stored on secure, encrypted servers. Call metadata is retained for moderation review and deleted within 30 days. If no mutual spark occurs, no trace of the call is kept. The Chemistry Replay Vault stores only text-based session notes, AI insights, and timestamps — no video or audio is ever recorded or stored.",
  },
  {
    title: "Your Rights",
    content:
      "You can request access to, correction of, or deletion of your personal data at any time. You can delete your account and all associated data from your profile settings. We comply with applicable Australian privacy legislation and GDPR where relevant.",
  },
  {
    title: "Contact",
    content:
      "For privacy inquiries, data requests, or concerns, contact us at privacy@getverity.com.au. We aim to respond within 5 business days.",
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy — Verity</title>
        <meta name="description" content="Verity's privacy policy. What data we collect, how we use it, your rights, and how to contact us. Your privacy is foundational." />
        <link rel="canonical" href="https://getverity.com.au/privacy" />
        <meta property="og:title" content="Privacy Policy — Verity" />
        <meta property="og:description" content="Verity's privacy policy. What data we collect, how we use it, your rights, and how to contact us. Your privacy is foundational." />
        <meta property="og:url" content="https://getverity.com.au/privacy" />
        <meta property="og:image" content="https://getverity.com.au/og-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Privacy Policy — Verity" />
        <meta name="twitter:description" content="Verity's privacy policy. What data we collect, how we use it, your rights, and how to contact us." />
        <meta name="twitter:image" content="https://getverity.com.au/og-logo.png" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
              Your privacy is foundational to Verity. Here's exactly what we collect, why, and what you control.
            </p>
            <p className="text-xs text-muted-foreground/40 mt-4">Last updated: March 2026</p>
          </motion.div>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h2 className="font-serif text-xl text-foreground mb-3">{section.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
