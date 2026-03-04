import { motion } from "framer-motion";
import { MessageCircle, Mic, Shield, Film } from "lucide-react";

const innovations = [
  {
    icon: MessageCircle,
    title: "Spark Reflection",
    description:
      "Private post-call AI insight for personal growth only. Tone and engagement analysis without transcription — e.g., \"You both showed highest energy discussing travel.\"",
  },
  {
    icon: Mic,
    title: "Verity Voice Intro",
    description:
      "After mutual spark, exchange optional 15-second voice notes before text chat unlocks. More human, deeper filtering.",
  },
  {
    icon: Shield,
    title: "Guardian Net",
    description:
      "One tap to share a safe-call signal with a trusted friend. They see only \"in Verity call until 9:12 pm\" — nothing else.",
  },
  {
    icon: Film,
    title: "Chemistry Replay Vault",
    description:
      "Session notes, AI insights, and timestamps from your mutual Spark calls — for your eyes only. Unlocked with Verity Pass. No video stored, ever.",
  },
];

const InnovationsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-luxury uppercase text-primary/60 mb-4 block">
            What nobody else is building
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
            Features that shouldn't need to be new.
          </h2>
        </motion.div>

        <div className="space-y-6">
          {innovations.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex items-start gap-6 bg-card border border-border rounded-lg p-6 md:p-8 hover:border-primary/20 transition-all duration-500"
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InnovationsSection;