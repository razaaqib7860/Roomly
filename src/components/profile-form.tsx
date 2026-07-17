import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhotoUpload } from "@/components/photo-upload";
import { BRANCHES, YEARS, BLOCKS, ROOM_PREFS } from "@/lib/constants";

type Profile = Tables<"profiles">;

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  branch: z.string().min(1, "Select a branch"),
  year: z.string().min(1, "Select a year"),
  photo_url: z.string().min(1, "Please upload a profile photo"),
  hobbies: z.string().trim().max(200).default(""),
  sleeping_schedule: z.enum(["early_bird", "night_owl", "flexible"]),
  smoking: z.enum(["no", "occasional", "yes"]),
  gaming: z.enum(["no", "casual", "hardcore"]),
  block_pref: z.string().min(1, "Pick a block preference"),
  room_pref: z.string().min(1, "Pick a room preference"),
  looking_for: z.string().trim().max(200).optional(),
  instagram: z.string().trim().max(60).optional(),
  whatsapp: z.string().trim().max(20).optional(),
  bio: z.string().trim().max(400).optional(),
});
type Form = z.infer<typeof schema>;

const empty: Form = {
  name: "", branch: "CSE", year: "1st", photo_url: "", hobbies: "",
  sleeping_schedule: "flexible", smoking: "no", gaming: "no",
  room_pref: "Double Sharing", room_pref: "No preference",
  looking_for: "", instagram: "", whatsapp: "", bio: "",
};

export function ProfileForm({
  userId, existing, isOnboarding, onDone,
}: {
  userId: string;
  existing: Profile | null;
  isOnboarding?: boolean;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(empty);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        branch: existing.branch,
        year: existing.year,
        photo_url: existing.photo_url ?? "",
        hobbies: existing.hobbies ?? "",
        sleeping_schedule: existing.sleeping_schedule as Form["sleeping_schedule"],
        smoking: existing.smoking as Form["smoking"],
        gaming: existing.gaming as Form["gaming"],
        block_pref: existing.block_pref ?? "No preference",
        room_pref: existing.room_pref ?? "No preference",
        looking_for: existing.looking_for ?? "",
        instagram: existing.instagram ?? "",
        whatsapp: existing.whatsapp ?? "",
        bio: existing.bio ?? "",
      });
    }
  }, [existing]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const v = parsed.data;
      const payload = {
        user_id: userId,
        name: v.name, branch: v.branch, year: v.year,
        photo_url: v.photo_url,
        hobbies: v.hobbies,
        sleeping_schedule: v.sleeping_schedule,
        smoking: v.smoking, gaming: v.gaming,
        block_pref: v.block_pref, room_pref: v.room_pref,
        looking_for: v.looking_for || null,
        instagram: v.instagram || null,
        whatsapp: v.whatsapp || null,
        bio: v.bio || null,
        onboarded: true,
      };
      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(isOnboarding ? "Welcome to Roomly!" : "Profile saved");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="animate-float-up space-y-5 rounded-3xl glass-strong p-5 sm:p-7">
      <div className="pb-2">
        <PhotoUpload
          userId={userId}
          currentPath={form.photo_url || null}
          name={form.name || "You"}
          onUploaded={(p) => setForm({ ...form, photo_url: p })}
        />
      </div>

      <Field label="Name *">
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Branch *">
          <Pick value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} options={[...BRANCHES]} />
        </Field>
        <Field label="Year *">
          <Pick value={form.year} onChange={(v) => setForm({ ...form, year: v })} options={[...YEARS]} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Block preference *">
          <Pick value={form.block_pref} onChange={(v) => setForm({ ...form, block_pref: v })} options={[...BLOCKS]} />
        </Field>
        <Field label="Room preference *">
          <Pick value={form.room_pref} onChange={(v) => setForm({ ...form, room_pref: v })} options={[...ROOM_PREFS]} />
        </Field>
      </div>

      <Field label="Hobbies (comma separated)">
        <Input value={form.hobbies} onChange={(e) => setForm({ ...form, hobbies: e.target.value })} placeholder="Cricket, coding, chai, music" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Sleep">
          <Pick value={form.sleeping_schedule} onChange={(v) => setForm({ ...form, sleeping_schedule: v as Form["sleeping_schedule"] })}
            options={["early_bird", "night_owl", "flexible"]}
            labels={{ early_bird: "Early bird", night_owl: "Night owl", flexible: "Flexible" }} />
        </Field>
        <Field label="Smoking">
          <Pick value={form.smoking} onChange={(v) => setForm({ ...form, smoking: v as Form["smoking"] })}
            options={["no", "occasional", "yes"]}
            labels={{ no: "No", occasional: "Occasional", yes: "Yes" }} />
        </Field>
        <Field label="Gaming">
          <Pick value={form.gaming} onChange={(v) => setForm({ ...form, gaming: v as Form["gaming"] })}
            options={["no", "casual", "hardcore"]}
            labels={{ no: "No", casual: "Casual", hardcore: "Hardcore" }} />
        </Field>
      </div>

      <Field label="Looking for (optional)">
        <Input value={form.looking_for ?? ""} onChange={(e) => setForm({ ...form, looking_for: e.target.value })} placeholder="e.g. Quiet studious roommate, prefers Block 2" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Instagram handle">
          <Input value={form.instagram ?? ""} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@yourhandle" />
        </Field>
        <Field label="WhatsApp number">
          <Input value={form.whatsapp ?? ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+91XXXXXXXXXX" />
        </Field>
      </div>

      <Field label="Short bio">
        <Textarea rows={3} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A couple of lines about you — what kind of roommate you're looking for…" />
      </Field>

      <Button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="w-full rounded-2xl py-6 text-sm font-semibold text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {isOnboarding ? "Enter Roomly" : "Save changes"}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Pick({ value, onChange, options, labels }: { value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="rounded-xl bg-card/60"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{labels?.[o] ?? o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
