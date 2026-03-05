import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const sections = [
  {
    title: "1. Eligibility",
    content:
      "You must be at least 18 years of age to use Verity. By creating an account, you confirm that you are 18 or older and that all information you provide is accurate. We verify age as part of our onboarding process and reserve the right to suspend accounts that fail verification.",
  },
  {
    title: "2. Your Account",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your account with others or allow unauthorised access. You must notify us immediately if you suspect any unauthorised use of your account.",
  },
  {
    title: "3. Acceptable Use",
    content:
      "You agree to treat all users with dignity and respect. You must not: harass, abuse, or threaten other users; share explicit, violent, or illegal content; attempt to circumvent anonymity protections; use the platform for commercial solicitation; impersonate another person; or violate any applicable law. Violations may result in immediate suspension or permanent ban.",
  },
  {
    title: "4. Privacy",
    content:
      "Your privacy is fundamental to Verity. We do not store video or audio from calls. Identity is only revealed upon mutual Spark — this is enforced server-side and cannot be bypassed. For full details on data collection, storage, and your rights, please read our Privacy Policy.",
  },
  {
    title: "5. Intellectual Property",
    content:
      "All content, design, and technology on Verity are owned by or licensed to us. You retain ownership of any content you create (messages, notes) but grant us a limited licence to operate the service. You may not copy, modify, or distribute any part of the platform without written permission.",
  },
  {
    title: "6. Subscriptions & Payments",
    content:
      "Verity offers both free and paid tiers. Paid subscriptions (Verity Pass) are billed through Stripe and may be cancelled at any time. Cancellation takes effect at the end of the current billing period. Refunds are handled in accordance with Australian Consumer Law.",
  },
  {
    title: "7. Limitation of Liability",
    content:
      "Verity is provided 'as is'. While we take extensive measures to ensure safety and quality, we cannot guarantee uninterrupted service or that all users will behave appropriately. To the maximum extent permitted by law, our liability is limited to the amount you have paid us in the 12 months preceding any claim.",
  },
  {
    title: "8. Termination",
    content:
      "We may suspend or terminate your account at any time for violations of these terms or our community guidelines. You may delete your account at any time through the Settings page. Upon deletion, we will remove your personal data in accordance with our Privacy Policy.",
  },
  {
    title: "9. Governing Law",
    content:
      "These terms are governed by the laws of Australia. Any disputes will be resolved in the courts of New South Wales, Australia. Nothing in these terms excludes or limits rights you may have under the Australian Consumer Law.",
  },
  {
    title: "10. Contact",
    content:
      "If you have questions about these terms, contact us at privacy@getverity.com.au.",
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service — Verity</title>
        <meta
          name="description"
          content="Verity's terms of service. Eligibility, acceptable use, privacy, payments, and governing law for Australia's verified anonymous speed dating platform."
        />
        <link rel="canonical" href="https://getverity.com.au/terms" />
        <meta property="og:title" content="Terms of Service — Verity" />
        <meta property="og:description" content="Verity's terms of service. Eligibility, acceptable use, privacy, payments, and governing law for Australia's verified anonymous speed dating platform." />
        <meta property="og:url" content="https://getverity.com.au/terms" />
        <meta property="og:image" content="https://getverity.com.au/og-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms of Service — Verity" />
        <meta name="twitter:description" content="Verity's terms of service. Eligibility, acceptable use, privacy, payments, and governing law." />
        <meta name="twitter:image" content="https://getverity.com.au/og-logo.png" />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-3xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-12">
            Last updated: March 2026
          </p>

          <div className="space-y-8">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-serif text-lg text-foreground mb-3">
                  {s.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
