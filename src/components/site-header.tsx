import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { LogOut, User as UserIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function SiteHeader() {
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl" style={{ background: "color-mix(in oklab, var(--background) 70%, transparent)" }}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16">
        <Link to="/" className="flex items-center gap-2.5">
         <div 
  className="grid h-9 w-9 place-items-center rounded-2xl shadow-[var(--shadow-card)]"
  style={{ background: "var(--gradient-hero)" }}
>
  <img 
    src="/roomly_logo.png"
    alt="Roomly Logo"
    className="h-7 w-7 object-contain"
  />
</div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-medium tracking-tight">Roomly</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">IIIT Ranchi</div>
          </div>
        </Link>
        {user ? (
          <nav className="flex items-center gap-1">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground sm:text-sm"
            >
              <UserIcon className="h-3.5 w-3.5" /> Profile
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground sm:text-sm"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </nav>
        ) : (
          <Link
            to="/auth"
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90 sm:text-sm"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
