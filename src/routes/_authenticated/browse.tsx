import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { RoommateCard } from "@/components/roommate-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Users, X } from "lucide-react";
import { BLOCKS, ROOM_PREFS } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export const Route = createFileRoute("/_authenticated/browse")({
  head: () => ({ meta: [{ title: "Browse roommates — Roomly" }, { name: "robots", content: "noindex" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("all");
  const [room, setRoom] = useState("all");
  const [sleep, setSleep] = useState("all");
  const [smoke, setSmoke] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles").select("*").eq("user_id", auth.user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!meLoading && (!me || !me.onboarded)) navigate({ to: "/onboarding" });
  }, [me, meLoading, navigate]);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles", me?.year, me?.user_id],
    enabled: !!me?.onboarded,
    // queryFn: async () => {
    //   const { data, error } = await supabase
    //     .from("profiles")
    //     .select("*")
    //     .eq("found_roommate", false)
    //     .eq("onboarded", true)
    //     .neq("user_id", me!.user_id)
    //     .eq("year", me!.year)
    //     .order("created_at", { ascending: false });
    //   if (error) throw error;
    //   return data as Profile[];
    // },
    queryFn: async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("user_id", me!.user_id)
    .eq("year", me!.year);

  console.log(data);
  console.log(error);

  if (error) throw error;

  return data;
},
  });

  const filtered = useMemo(() => {
    if (!profiles) return [];
    const q = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (block !== "all" && p.block_pref !== block) return false;
      if (room !== "all" && p.room_pref !== room) return false;
      if (sleep !== "all" && p.sleeping_schedule !== sleep) return false;
      if (smoke !== "all" && p.smoking !== smoke) return false;
      if (q && !(p.name.toLowerCase().includes(q) || (p.hobbies ?? "").toLowerCase().includes(q) || (p.bio ?? "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [profiles, search, block, room, sleep, smoke]);

  const computeCompatibility = (p: Profile): string[] => {
    if (!me) return [];
    const tags: string[] = [];
    if (me.sleeping_schedule === p.sleeping_schedule) tags.push("Same schedule");
    if (me.smoking === p.smoking) tags.push("Smoking match");
    if (me.block_pref && me.block_pref === p.block_pref) tags.push("Same block");
    if (me.room_pref && me.room_pref === p.room_pref) tags.push("Room match");
    if (me.branch === p.branch) tags.push(me.branch);
    return tags;
  };

  const clearFilters = () => { setBlock("all"); setRoom("all"); setSleep("all"); setSmoke("all"); setSearch(""); };
  const activeFilters = [block, room, sleep, smoke].filter((v) => v !== "all").length + (search ? 1 : 0);

  return (
    <div className="min-h-screen pb-24">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:pt-10">
        {/* Hero header */}
        <div className="animate-float-up mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Year {me?.year} · {me?.branch ?? ""}</p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">Your batchmates</h1>
            <p className="mt-1 text-xs text-muted-foreground">Only students from your year appear here.</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilters > 0 && (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{activeFilters}</span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search names, hobbies, bios…"
            className="pl-10 rounded-2xl bg-card/60"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="animate-float-up mb-6 grid gap-2 rounded-2xl glass p-3 sm:grid-cols-4">
            <PickFilter value={block} onChange={setBlock} label="Block" options={[...BLOCKS]} />
            <PickFilter value={room} onChange={setRoom} label="Room" options={[...ROOM_PREFS]} />
            <PickFilter value={sleep} onChange={setSleep} label="Sleep" options={["early_bird", "night_owl", "flexible"]} labels={{ early_bird: "Early bird", night_owl: "Night owl", flexible: "Flexible" }} />
            <PickFilter value={smoke} onChange={setSmoke} label="Smoking" options={["no", "occasional", "yes"]} labels={{ no: "No", occasional: "Occasional", yes: "Yes" }} />
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="col-span-full inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading || meLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={activeFilters > 0} onClear={clearFilters} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <RoommateCard key={p.user_id} p={p} compatibility={computeCompatibility(p)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function PickFilter({ value, onChange, label, options, labels }: { value: string; onChange: (v: string) => void; label: string; options: string[]; labels?: Record<string, string> }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="rounded-xl bg-card/60"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{labels?.[o] ?? o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Skeleton() {
  return <div className="h-[420px] animate-pulse rounded-3xl bg-card/40" />;
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="animate-float-up mx-auto max-w-md rounded-3xl glass-strong p-10 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Users className="h-6 w-6" />
      </div>
      <h3 className="font-display text-2xl">{hasFilters ? "No matches yet" : "No batchmates here yet"}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        {hasFilters
          ? "Try clearing some filters — you might be missing someone great."
          : "Tell your year-mates about Roomly. Once they sign up, they'll show up here."}
      </p>
      <div className="mt-5">
        {hasFilters ? (
          <button onClick={onClear} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Clear filters</button>
        ) : (
          <Link to="/profile" className="inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Update your profile</Link>
        )}
      </div>
    </div>
  );
}
