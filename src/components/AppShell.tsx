import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Settings, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useGradeBMode } from "@/contexts/GradeBModeContext";

type NavItem = { to: string; label: string; end?: boolean };

const STUDENT_NAV: readonly NavItem[] = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/builder", label: "Essay Builder" },
  { to: "/essay-marker", label: "Essay Marker" },
  { to: "/paragraph-builder", label: "Paragraph Builder" },
  { to: "/paragraph-engine", label: "Paragraph Engine" },
  { to: "/timed", label: "Timed Practice" },
  { to: "/practise", label: "Practise" },
  { to: "/revise", label: "Revise" },
  { to: "/toolkit", label: "Retrieval Toolkit" },
  { to: "/drill", label: "Retrieval Drill" },
  { to: "/architecture", label: "Text Architecture" },
  { to: "/routes", label: "Comparison Routes" },
  { to: "/flex", label: "Interpretive Flex" },
  { to: "/compare", label: "Compare" },
  { to: "/theme-wheel", label: "Theme Wheel" },
  { to: "/matrix", label: "Comparative Matrix" },
  { to: "/library", label: "Library" },
  { to: "/library/quotes", label: "Quotes" },
  { to: "/library/quote-bank", label: "Method Bank" },
  { to: "/library/questions", label: "Questions" },
  { to: "/library/stems", label: "Paragraph Stems" },
  { to: "/library/thesis", label: "Thesis & Paragraph" },
  { to: "/library/context", label: "Context" },
  { to: "/library/glossary", label: "Glossary" },
  { to: "/learn", label: "Learn" },
  { to: "/modules", label: "Modules" },
];

export default function AppShell() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const { gradeBMode, setGradeBMode } = useGradeBMode();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-dvh bg-background text-ink flex flex-col">
      <header className="border-b border-rule bg-paper/80 backdrop-blur-sm sticky top-0 z-30 no-print">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-xl font-medium tracking-tight">Prose Craft Aid</span>
              <span className="label-eyebrow hidden sm:inline">Hard Times · Atonement</span>
            </div>
            <div className="flex items-center gap-3">
              <label
                htmlFor="grade-b-mode"
                className="hidden md:inline-flex items-center gap-2 border border-rule bg-paper-dim/50 px-2.5 py-1.5 rounded-sm"
              >
                <span className="text-xs font-mono text-ink-muted">Grade B Mode</span>
                <Switch
                  id="grade-b-mode"
                  checked={gradeBMode}
                  onCheckedChange={setGradeBMode}
                  aria-label="Toggle Grade B Mode"
                  className="h-5 w-9 data-[state=checked]:bg-primary"
                />
              </label>
              {!loading && (
                user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="h-8 gap-1 text-ink-muted hover:text-ink"
                    title={user.email ?? "Sign out"}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                ) : (
                  <NavLink
                    to="/auth"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-sm border-b-2 border-transparent text-ink-muted hover:text-ink hover:bg-paper-dim"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Sign in
                  </NavLink>
                )
              )}
            </div>
          </div>

          <nav className="mt-3 flex items-center gap-1 sm:gap-2 overflow-x-auto" aria-label="Primary navigation">
            {STUDENT_NAV.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm font-medium rounded-sm border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-ink"
                      : "border-transparent text-ink-muted hover:text-ink hover:bg-paper-dim"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm font-medium rounded-sm border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-ink"
                      : "border-transparent text-ink-muted hover:text-ink hover:bg-paper-dim"
                  }`
                }
              >
                <Settings className="h-3.5 w-3.5" />
                Admin
              </NavLink>
            )}
            <label
              htmlFor="grade-b-mode-mobile"
              className="md:hidden inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm border-b-2 border-transparent text-ink-muted"
            >
              <span>Grade B Mode</span>
              <Switch
                id="grade-b-mode-mobile"
                checked={gradeBMode}
                onCheckedChange={setGradeBMode}
                aria-label="Toggle Grade B Mode"
                className="h-5 w-9 data-[state=checked]:bg-primary"
              />
            </label>
          </nav>
        </div>
      </header>
      {gradeBMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs sm:text-sm no-print">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-2 flex items-center gap-2">
            <span className="font-mono font-medium uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-amber-200/60 rounded-sm">Grade B Mode</span>
            <span>Scaffolded view: sentence starters, accessible language, and structured prompts replace A/A* insight rows.</span>
          </div>
        </div>
      )}
      <main className="flex-1 print-area">
        <Outlet />
      </main>
    </div>
  );
}
