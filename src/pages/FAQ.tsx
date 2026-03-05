import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const faqs = [
  {
    question: "Is it really anonymous if it's video?",
    answer:
      "Yes. Your video is anonymised at the track level before it reaches the other person. We use canvas-processed video — your raw camera feed is never transmitted. The other person sees an anonymised version of you (pixelated silhouette). This cannot be bypassed via browser DevTools because the raw track is never published. Identity is only revealed if both people independently choose Spark.",
  },
  {
    question: "Is anything recorded?",
    answer:
      "No. Video and audio are live-only and are never recorded, stored, or replayed — not by us, not by any third party. When the call ends, it's gone. Our Chemistry Replay Vault stores only text-based session notes and AI-generated insights. We take a strong stance: no recordings, ever.",
  },
  {
    question: "How does Spark work?",
    answer:
      "At the end of a 45-second anonymous video call, both people independently choose Spark or Pass. This decision is private and resolved server-side. If both choose Spark, identities are revealed and chat is unlocked. If either person passes, neither person ever learns the other's choice. There are no rejection notifications — just dignity.",
  },
  {
    question: "How do you verify 18+?",
    answer:
      "We require age verification before you can join any Drop. We verify your age but store only your verification status — never your identity documents. This ensures all participants are adults while respecting your privacy.",
  },
  {
    question: "What data do you keep?",
    answer:
      "We store your account information (email, display name, preferences), verification status, match history (mutual Sparks only), and chat messages. We do not store video, audio, identity documents, or any data about non-mutual interactions. You can read our full Privacy Policy for details, and you can delete your account and all associated data at any time.",
  },
  {
    question: "How do you handle bad actors?",
    answer:
      "We use AI moderation during live sessions to detect policy violations in real time. Any user can exit a call or file a report with a single tap. Reports are reviewed by our team. Violations of our zero-tolerance policy result in immediate suspension. Users who are actioned can appeal to a human reviewer.",
  },
  {
    question: "Can I delete my data?",
    answer:
      "Yes. You can delete your account and all associated data at any time through the Settings page. This includes your profile, match history, messages, and any vault entries. Deletion is permanent and cannot be undone.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>FAQ — Verity | Your Questions Answered</title>
        <meta
          name="description"
          content="Frequently asked questions about Verity's anonymous speed dating: privacy, Spark mechanics, verification, recordings, data, and safety."
        />
        <link rel="canonical" href="https://getverity.com.au/faq" />
        <meta property="og:title" content="FAQ — Verity | Your Questions Answered" />
        <meta property="og:description" content="Frequently asked questions about Verity's anonymous speed dating: privacy, Spark mechanics, verification, recordings, data, and safety." />
        <meta property="og:url" content="https://getverity.com.au/faq" />
        <meta property="og:image" content="https://getverity.com.au/og-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FAQ — Verity | Your Questions Answered" />
        <meta name="twitter:description" content="Frequently asked questions about Verity's anonymous speed dating: privacy, Spark mechanics, verification, recordings, data, and safety." />
        <meta name="twitter:image" content="https://getverity.com.au/og-logo.png" />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs tracking-luxury uppercase text-primary/60 mb-4 block">
              Questions
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
              Frequently asked questions
            </h1>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="font-serif text-foreground text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-16">
            <p className="text-sm text-muted-foreground mb-6">
              Still have questions? Read our{" "}
              <Link to="/safety" className="text-primary hover:underline">
                Safety Promise
              </Link>{" "}
              or{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <Link to="/auth">
              <Button variant="gold" size="lg" className="group">
                RSVP for the next Drop
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
