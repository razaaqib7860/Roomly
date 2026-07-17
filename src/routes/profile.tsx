import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getStoredProfile, setStoredProfile, clearStoredProfile } from "@/lib/profile-store";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Save, Eye, EyeOff, Trash2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Find Your Roommate" },
      { name: "description", content: "Create or edit your roommate profile at IIIT Ranchi." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  branch: z.string().min(1, "Select a branch"),
  year: z.string().min(1, "Select a year"),
  hobbies: z.string().trim().max(200).default(""),
  sleeping_schedule: z.enum(["early_bird", "night_owl", "flexible"]),
  smoking: z.enum(["no", "occasional", "yes"]),
  gaming: z.enum(["no", "casual", "hardcore"]),
  instagram: z.string().trim().max(60).default(""),
  whatsapp: z.string().trim().max(20).default(""),
  bio: z.string().trim().max(400).default(""),
});

type FormState = z.infer<typeof schema>;

const empty: FormState = {
  name: "", branch: "CSE", year: "1st", hobbies: "",
  sleeping_schedule: "flexible", smoking: "no", gaming: "no",
  instagram: "", whatsapp: "", bio: "",
};

function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [stored, setLocalStored] = useState(() => (typeof window !== "undefined" ? getStoredProfile() : null));
  const [form, setForm] = useState<FormState>(empty);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["my-profile", stored?.id],
    enabled: !!stored?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("id", stored!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        branch: existing.branch,
        year: existing.year,
        hobbies: existing.hobbies ?? "",
        sleeping_schedule: existing.sleeping_schedule as FormState["sleeping_schedule"],
        smoking: existing.smoking as FormState["smoking"],
        gaming: existing.gaming as FormState["gaming"],
        instagram: existing.instagram ?? "",
        whatsapp: existing.whatsapp ?? "",
        bio: existing.bio ?? "",
      });
    }
  }, [existing]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      }
      const values = parsed.data;
      if (stored) {
        const { error } = await supabase.rpc("update_profile", {
          p_id: stored.id,
          p_token: stored.token,
          p_name: values.name,
          p_branch: values.branch,
          p_year: values.year,
          p_hobbies: values.hobbies,
          p_sleeping_schedule: values.sleeping_schedule,
          p_smoking: values.smoking,
          p_gaming: values.gaming,
          p_instagram: values.instagram,
          p_whatsapp: values.whatsapp,
          p_bio: values.bio,
          p_found_roommate: existing?.found_roommate ?? false,
        });
        if (error) throw error;
        return stored;
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .insert({ ...values })
          .select("id, owner_token")
          .single();
        if (error) throw error;
        const s = { id: data.id, token: data.owner_token };
        setStoredProfile(s);
        setLocalStored(s);
        return s;
      }
    },
    onSuccess: () => {
      toast.success("Profile saved.");
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFound = useMutation({
    mutationFn: async (found: boolean) => {
      if (!stored) return;
      const { error } = await supabase.rpc("set_found_roommate", {
        p_id: stored.id, p_token: stored.token, p_found: found,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const forget = () => {
    clearStoredProfile();
    setLocalStored(null);
    setForm(empty);
    toast.info("Local session cleared. Your public listing still exists — mark 'Found' from the device you created it.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <button onClick={() => navigate({ to: "/" })} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </button>

        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {stored ? "Edit your profile" : "Create your profile"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fields marked with * are required. Share only what you're comfortable with — your contact info will be visible to other students.
        </p>

        {stored && existing?.found_roommate && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <strong className="font-semibold">You're currently marked as "Found Roommate"</strong> — your card is hidden from the list.
            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={() => toggleFound.mutate(false)}>
                <Eye className="mr-2 h-3.5 w-3.5" /> Show me again
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          {isLoading && stored ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              <Field label="Name *">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Branch *">
                  <PickSelect value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} options={["CSE", "ECE", "IT", "Other"]} />
                </Field>
                <Field label="Year *">
                  <PickSelect value={form.year} onChange={(v) => setForm({ ...form, year: v })} options={["1st", "2nd", "3rd", "4th", "MTech / PG"]} />
                </Field>
              </div>

              <Field label="Hobbies (comma-separated)">
                <Input value={form.hobbies} onChange={(e) => setForm({ ...form, hobbies: e.target.value })} placeholder="Cricket, coding, chai, music" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Sleeping schedule">
                  <PickSelect
                    value={form.sleeping_schedule}
                    onChange={(v) => setForm({ ...form, sleeping_schedule: v as FormState["sleeping_schedule"] })}
                    options={["early_bird", "night_owl", "flexible"]}
                    labels={{ early_bird: "Early bird", night_owl: "Night owl", flexible: "Flexible" }}
                  />
                </Field>
                <Field label="Smoking">
                  <PickSelect
                    value={form.smoking}
                    onChange={(v) => setForm({ ...form, smoking: v as FormState["smoking"] })}
                    options={["no", "occasional", "yes"]}
                    labels={{ no: "No", occasional: "Occasional", yes: "Yes" }}
                  />
                </Field>
                <Field label="Gaming">
                  <PickSelect
                    value={form.gaming}
                    onChange={(v) => setForm({ ...form, gaming: v as FormState["gaming"] })}
                    options={["no", "casual", "hardcore"]}
                    labels={{ no: "No", casual: "Casual", hardcore: "Hardcore" }}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Instagram handle">
                  <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@yourhandle" />
                </Field>
                <Field label="WhatsApp number">
                  <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+91XXXXXXXXXX" />
                </Field>
              </div>

              <Field label="Short bio">
                <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A couple of lines about you — what kind of roommate you're looking for…" />
              </Field>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-primary text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" />
                  {stored ? "Save changes" : "Publish profile"}
                </Button>
                {stored && !existing?.found_roommate && (
                  <Button variant="outline" onClick={() => toggleFound.mutate(true)} disabled={toggleFound.isPending} className="rounded-full">
                    <EyeOff className="mr-2 h-4 w-4" /> Mark as found
                  </Button>
                )}
                {stored && (
                  <Button variant="ghost" onClick={forget} className="ml-auto text-muted-foreground">
                    <Trash2 className="mr-2 h-4 w-4" /> Forget on this device
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PickSelect({
  value, onChange, options, labels,
}: { value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{labels?.[o] ?? o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
