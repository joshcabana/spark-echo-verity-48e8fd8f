import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const trustChips = [
  "18+ verified",
  "No video stored",
  "Mutual consent reveal",
  "One‑tap exit + report",
  "Scheduled Drops (no infinite scroll)",
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="relative z-10 container max-w-4xl mx-auto px-6 pt-20 text-center">
        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
        >
          {trustChips.map((chip) => (
            <span
              key={chip}
              className="text-[10px] tracking-luxury uppercase text-primary/80 border border-primary/20 px-3 py-1.5 rounded-full"
            >
              {chip}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 text-foreground"
        >
          Anonymous 45‑second video dates.{" "}
          <span className="text-gold-gradient italic">
            Reveal only with mutual Spark.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          Verified 18+. No profiles. No swiping. Just eyes + voice for 45
          seconds — then you both choose: Spark or walk. Dignity either way.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/auth">
            <Button
              variant="gold"
              size="xl"
              className="group"
              aria-label="RSVP for the next Drop — sign up for Verity"
            >
              RSVP for the next Drop
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button
              variant="gold-outline"
              size="xl"
              aria-label="Learn how Verity works"
            >
              How it works
            </Button>
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-16 text-xs text-muted-foreground/60 tracking-luxury uppercase"
        >
          Verified 18+ · Anonymous until mutual spark · Nothing stored
        </motion.p>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
