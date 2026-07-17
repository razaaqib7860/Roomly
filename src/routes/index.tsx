import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStoredProfile } from "@/lib/profile-store";
import { toast } from "sonner";
import {
  Search, Instagram, MessageCircle, Moon, Sun, Cigarette, Gamepad2,
  GraduationCap, Sparkles, CheckCircle2, UserPlus,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type Profile = {
  id: string;
  name: string;
  branch: string;
  year: string;
  hobbies: string;
  sleeping_schedule: string;
  smoking: string;
  gaming: string;
  instagram: string | null;
  whatsapp: string | null;
  bio: string | null;
  found_roommate: boolean;
  created_at: string;
};

const BRANCHES = ["CSE", "ECE", "IT", "Other"];
const YEARS = ["1st", "2nd", "3rd", "4th", "MTech / PG"];

function HomePage() {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [year, setYear] = useState("all");
  const [sleep, setSleep] = useState("all");
  const [smoke, setSmoke] = useState("all");
  const [gaming, setGaming] = useState("all");

  const qc = useQueryClient();
  const stored = typeof window !== "undefined" ? getStoredProfile() : null;

  const { data, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,name,branch,year,hobbies,sleeping_schedule,smoking,gaming,instagram,whatsapp,bio,found_roommate,created_at")
        .eq("found_roommate", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const markFound = useMutation({
    mutationFn: async () => {
      if (!stored) throw new Error("No profile");
      const { error } = await supabase.rpc("set_found_roommate", {
        p_id: stored.id, p_token: stored.token, p_found: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marked as found. Your profile is hidden from the list.");
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((p) => {
      if (branch !== "all" && p.branch !== branch) return false;
      if (year !== "all" && p.year !== year) return false;
      if (sleep !== "all" && p.sleeping_schedule !== sleep) return false;
      if (smoke !== "all" && p.smoking !== smoke) return false;
      if (gaming !== "all" && p.gaming !== gaming) return false;
      if (q && !(
        p.name.toLowerCase().includes(q) ||
        p.hobbies.toLowerCase().includes(q) ||
        (p.bio ?? "").toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [data, search, branch, year, sleep, smoke, gaming]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{ background: "var(--gradient-soft)" }}
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 sm:flex sm:justify-between">
            <div className="min-w-0 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Built for IIIT Ranchi students
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Find the roommate <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">who fits your vibe.</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Browse profiles of students looking for roommates. Filter by branch, year, and lifestyle — then reach out on Instagram or WhatsApp.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:opacity-90"
                >
                  <UserPlus className="h-4 w-4" />
                  {stored ? "Edit my profile" : "Create your profile"}
                </Link>
                {stored && (
                  <Button
                    variant="outline"
                    onClick={() => markFound.mutate()}
                    disabled={markFound.isPending}
                    className="rounded-full"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    I found my roommate
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden shrink-0 sm:block">
              <div className="grid h-40 w-40 place-items-center rounded-3xl bg-[image:var(--gradient-hero)] shadow-[var(--shadow-elegant)]">
                <Users className="h-20 w-20 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="grid gap-3 md:grid-cols-[1.5fr_repeat(5,1fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, hobbies, bio…"
                className="pl-9"
              />
            </div>
            <FilterSelect value={branch} onChange={setBranch} label="Branch" options={BRANCHES} />
            <FilterSelect value={year} onChange={setYear} label="Year" options={YEARS} />
            <FilterSelect value={sleep} onChange={setSleep} label="Sleep" options={["early_bird", "night_owl", "flexible"]} labels={{ early_bird: "Early bird", night_owl: "Night owl", flexible: "Flexible" }} />
            <FilterSelect value={smoke} onChange={setSmoke} label="Smoking" options={["no", "occasional", "yes"]} labels={{ no: "No", occasional: "Occasional", yes: "Yes" }} />
            <FilterSelect value={gaming} onChange={setGaming} label="Gaming" options={["no", "casual", "hardcore"]} labels={{ no: "No", casual: "Casual", hardcore: "Hardcore" }} />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold">No matches found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing filters, or be the first — create your own profile.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <ProfileCard key={p.id} p={p} isMine={stored?.id === p.id} />)}
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Made for IIIT Ranchi · Reach out safely. Verify identity before meeting.
      </footer>
    </div>
  );
}

function FilterSelect({
  value, onChange, label, options, labels,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{labels?.[o] ?? o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ProfileCard({ p, isMine }: { p: Profile; isMine: boolean }) {
  const initials = p.name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  const wa = p.whatsapp?.replace(/[^\d+]/g, "");
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
      <div className="flex items-center gap-3 p-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-hero)] font-display text-lg font-bold text-primary-foreground">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-bold">{p.name}</h3>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            {p.branch} · {p.year} year
          </p>
        </div>
        {isMine && <Badge className="shrink-0 bg-primary/10 text-primary hover:bg-primary/10">You</Badge>}
      </div>

      {p.bio && (
        <p className="line-clamp-3 px-5 text-sm leading-relaxed text-foreground/80">{p.bio}</p>
      )}

      {p.hobbies && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-3">
          {p.hobbies.split(",").map((h) => h.trim()).filter(Boolean).slice(0, 5).map((h) => (
            <span key={h} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{h}</span>
          ))}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-3 border-t border-border/60 text-center text-xs">
        <TraitCell icon={p.sleeping_schedule === "night_owl" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />} label={p.sleeping_schedule === "early_bird" ? "Early" : p.sleeping_schedule === "night_owl" ? "Night" : "Flexible"} />
        <TraitCell icon={<Cigarette className="h-3.5 w-3.5" />} label={p.smoking === "no" ? "No smoke" : p.smoking === "yes" ? "Smokes" : "Occasional"} />
        <TraitCell icon={<Gamepad2 className="h-3.5 w-3.5" />} label={p.gaming === "no" ? "No gaming" : p.gaming === "hardcore" ? "Hardcore" : "Casual"} />
      </dl>

      <div className="mt-auto flex gap-2 border-t border-border/60 p-3">
        {p.instagram && (
          <a
            href={`https://instagram.com/${p.instagram.replace(/^@/, "")}`}
            target="_blank" rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-accent"
          >
            <Instagram className="h-3.5 w-3.5" /> Instagram
          </a>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa.replace(/^\+/, "")}`}
            target="_blank" rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        )}
        {!p.instagram && !wa && (
          <div className="flex-1 py-2 text-center text-xs text-muted-foreground">No contact provided</div>
        )}
      </div>
    </article>
  );
}

function TraitCell({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 border-r border-border/60 px-2 py-3 last:border-r-0 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="truncate font-medium">{label}</span>
    </div>
  );
}

// tiny local re-export to avoid another import line
import { Users } from "lucide-react";
