import { Link } from "react-router-dom";
import VerityLogo from "@/components/VerityLogo";

const footerLinks = [
  { label: "How it works", to: "/how-it-works" },
  { label: "Drops", to: "/drops" },
  { label: "Safety", to: "/safety" },
  { label: "Pricing", to: "/pricing" },
  { label: "FAQ", to: "/faq" },
  { label: "About", to: "/about" },
  { label: "Transparency", to: "/transparency" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <VerityLogo className="h-6 w-auto" linkTo="/" />
            <span className="text-xs text-muted-foreground/50">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/onboarding"
              className="hover:text-primary transition-colors"
            >
              Get verified
            </Link>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-border/30">
          <span className="text-xs text-muted-foreground/60">
            18+ verified · Nothing stored until mutual Spark
          </span>
          <span className="text-xs text-muted-foreground/40 hidden sm:inline">
            ·
          </span>
          <span className="text-xs text-muted-foreground/60">
            🇦🇺 Australian Built
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
