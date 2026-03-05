import { useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const HIDDEN_ROUTES = ["/", "/call", "/how-it-works", "/drops", "/safety", "/pricing", "/faq", "/terms", "/about", "/transparency", "/privacy"];

const AppHeader = () => {
  const { pathname } = useLocation();

  const hidden = HIDDEN_ROUTES.some((r) =>
    r === "/" ? pathname === "/" : pathname.startsWith(r)
  );

  if (hidden) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>
  );
};

export default AppHeader;
