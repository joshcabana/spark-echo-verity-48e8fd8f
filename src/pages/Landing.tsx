import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import InnovationsSection from "@/components/landing/InnovationsSection";
import TrustSection from "@/components/landing/TrustSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Verity — Real Chemistry in 45 Seconds</title>
        <meta name="description" content="Verified 18+ anonymous speed dating. Real chemistry in 45 seconds. Mutual spark only. Dignity always." />
        <link rel="canonical" href="https://getverity.com.au" />
        <meta property="og:title" content="Verity — Real Chemistry in 45 Seconds" />
        <meta property="og:description" content="Verified 18+ anonymous speed dating. Real chemistry in 45 seconds. Mutual spark only. Dignity always." />
        <meta property="og:url" content="https://getverity.com.au" />
        <meta property="og:image" content="https://getverity.com.au/og-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Verity — Real Chemistry in 45 Seconds" />
        <meta name="twitter:description" content="Verified 18+ anonymous speed dating. Real chemistry in 45 seconds. Mutual spark only. Dignity always." />
        <meta name="twitter:image" content="https://getverity.com.au/og-logo.png" />
      </Helmet>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <InnovationsSection />
      <TrustSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;
