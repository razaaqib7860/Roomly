import type { Tables } from "@/integrations/supabase/types";
import { ProfilePhoto } from "./profile-photo";
import { Instagram, MessageCircle, Moon, Sun, Cigarette, Gamepad2, Home, Users, Sparkles, GraduationCap } from "lucide-react";

type Profile = Tables<"profiles">;

export function RoommateCard({ p, compatibility }: { p: Profile; compatibility?: string[] }) {
  const wa = p.whatsapp?.replace(/[^\d+]/g, "");
  const sleepIcon = p.sleeping_schedule === "night_owl" ? Moon : Sun;
  const SleepIcon = sleepIcon;

  return (
    <article className="animate-float-up group relative overflow-hidden rounded-3xl glass-strong shadow-[var(--shadow-card)] transition duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{ background: "var(--gradient-mesh)" }}
        aria-hidden
      />

      {/* Photo hero */}
      <div className="flex flex-col items-center px-6 pb-4 pt-8">
        <ProfilePhoto path={p.photo_url} name={p.name} size="lg" className="ring-4 ring-primary/20" />
        <h3 className="mt-4 text-center font-display text-2xl font-medium tracking-tight">{p.name}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          {p.branch} · {p.year} year
        </div>
      </div>

      {compatibility && compatibility.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 px-6 pb-3">
          {compatibility.slice(0, 3).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-2.5 w-2.5" /> {t}
            </span>
          ))}
        </div>
      )}

      {p.bio && (
        <p className="px-6 pb-4 text-center text-sm leading-relaxed text-foreground/85">{p.bio}</p>
      )}

      {/* Preferences grid */}
      <div className="grid grid-cols-2 gap-px bg-white/5 px-4 mx-2 rounded-2xl overflow-hidden text-xs">
        <Detail icon={<Home className="h-3.5 w-3.5" />} label="Block" value={p.block_pref ?? "—"} />
        <Detail icon={<Users className="h-3.5 w-3.5" />} label="Room" value={p.room_pref ?? "—"} />
        <Detail icon={<SleepIcon className="h-3.5 w-3.5" />} label="Sleep" value={sleepLabel(p.sleeping_schedule)} />
        <Detail icon={<Cigarette className="h-3.5 w-3.5" />} label="Smoking" value={smokeLabel(p.smoking)} />
        <Detail icon={<Gamepad2 className="h-3.5 w-3.5" />} label="Gaming" value={gamingLabel(p.gaming)} />
        {p.religion && <Detail icon={<Sparkles className="h-3.5 w-3.5" />} label="Religion" value={p.religion} />}
      </div>

      {p.hobbies && (
        <div className="flex flex-wrap gap-1.5 px-6 pt-4">
          {p.hobbies.split(",").map((h) => h.trim()).filter(Boolean).slice(0, 6).map((h) => (
            <span key={h} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
              {h}
            </span>
          ))}
        </div>
      )}

      {p.looking_for && (
        <div className="mx-6 mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">Looking for</div>
          <p className="text-foreground/85">{p.looking_for}</p>
        </div>
      )}

      <div className="mt-5 flex gap-2 border-t border-white/5 p-3">
        {p.instagram && (
          <a
            href={`https://instagram.com/${p.instagram.replace(/^@/, "")}`}
            target="_blank" rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-foreground/90 transition hover:bg-white/10"
          >
            <Instagram className="h-3.5 w-3.5" /> Instagram
          </a>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa.replace(/^\+/, "")}`}
            target="_blank" rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90"
            style={{ background: "var(--gradient-hero)" }}
          >
            <MessageCircle className="h-3.5 w-3.5" /> Message
          </a>
        )}
        {!p.instagram && !wa && (
          <div className="flex-1 py-2 text-center text-xs text-muted-foreground">No contact provided</div>
        )}
      </div>
    </article>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-card/50 px-3 py-2.5">
      <span className="text-primary/80">{icon}</span>
      <div className="min-w-0">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-[11px] font-medium">{value}</div>
      </div>
    </div>
  );
}

function sleepLabel(v: string) { return v === "early_bird" ? "Early bird" : v === "night_owl" ? "Night owl" : "Flexible"; }
function smokeLabel(v: string) { return v === "no" ? "Non-smoker" : v === "yes" ? "Smoker" : "Occasional"; }
function gamingLabel(v: string) { return v === "no" ? "No gaming" : v === "hardcore" ? "Hardcore" : "Casual"; }
