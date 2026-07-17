import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-card)]">
            <Users className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight">Find Your Roommate</div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              IIIT Ranchi
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-block"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
          >
            Browse
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90"
          >
            My Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
