import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { SiteHeader } from "@/components/site-header";
import { ArrowRight, Shield, Sparkles, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roomly — Roommate matching for IIIT Ranchi" },
      { name: "description", content: "Sign in with your @iiitranchi.ac.in email to find same-year students looking for a roommate." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/browse" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="relative overflow-hidden">
        {/* Mesh backdrop */}
        <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-mesh)" }} aria-hidden />

        <section className="mx-auto max-w-5xl px-5 pb-20 pt-14 sm:pt-24">
          <div className="animate-float-up mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/80 backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Made only for IIIT Ranchi students
            </div>

            <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl md:text-[5.5rem]">
              Find a roommate <br />
              <span className="italic text-gradient">who fits your vibe.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
              A private space to match with same-year classmates before hostel allotment.
              Sign in with your college email to get started.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/auth"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:scale-[1.02] sm:w-auto"
                style={{ background: "var(--gradient-hero)" }}
              >
                Get started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <div className="text-[11px] text-muted-foreground">Only <span className="text-foreground/80">@iiitranchi.ac.in</span> emails</div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="mx-auto mt-20 grid max-w-4xl gap-3 sm:grid-cols-3">
            <Feature
              icon={<Users className="h-4 w-4" />}
              title="Same-year only"
              body="You see only your batchmates. No juniors, no seniors, no outsiders."
            />
            <Feature
              icon={<Shield className="h-4 w-4" />}
              title="College email required"
              body="Every account is verified against @iiitranchi.ac.in. Your info stays inside the campus."
            />
            <Feature
              icon={<Zap className="h-4 w-4" />}
              title="Built for mobile"
              body="Swipe-friendly cards, quick contact via WhatsApp or Instagram. No feeds, no noise."
            />
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 text-center text-[11px] text-muted-foreground">
          Made for IIIT Ranchi. This is a roommate finder — not a dating app.
        </footer>
      </main>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-5 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">{icon}</div>
      <h3 className="font-display text-lg">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
