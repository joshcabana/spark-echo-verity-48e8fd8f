import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import VerityLogo from "@/components/VerityLogo";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "How it works", to: "/how-it-works" },
  { label: "Drops", to: "/drops" },
  { label: "Safety", to: "/safety" },
  { label: "Pricing", to: "/pricing" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <VerityLogo className="h-7 w-auto" linkTo="/" />

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            to="/auth"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link to="/auth">
            <Button variant="gold" size="sm">
              RSVP for the next Drop
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <div className="container max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Sign in
              </Link>
              <div className="flex items-center justify-between mt-2">
                <ThemeToggle />
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button variant="gold" size="sm">
                    RSVP for the next Drop
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
