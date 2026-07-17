import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { ProfileForm } from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My profile — Roomly" }, { name: "robots", content: "noindex" }] }),
  component: EditProfilePage,
});

function EditProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id); });
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", userId],
    enabled: !!userId,

    // queryFn: async () => {
    //   const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId!).maybeSingle();
    //   if (error) throw error;
    //   return data;
    // },
  queryFn: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId!)
      .maybeSingle();

    console.log("PROFILE =>", data);

    if (error) throw error;

    return data;
  },
});


  const toggleFound = useMutation({
    mutationFn: async (found: boolean) => {
      const { error } = await supabase.from("profiles").update({ found_roommate: found }).eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!userId || isLoading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <button onClick={() => navigate({ to: "/browse" })} className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to browse
        </button>

        <h1 className="font-display text-4xl">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your details or hide yourself from the list once you've found a roommate.</p>

        {profile?.found_roommate && (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <strong className="font-medium">You're currently marked as "Found roommate"</strong> — your card is hidden.
            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={() => toggleFound.mutate(false)} className="rounded-full">
                <Eye className="mr-2 h-3.5 w-3.5" /> Show me again
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <ProfileForm userId={userId} existing={profile ?? null} onDone={() => navigate({ to: "/browse" })} />
        </div>

        {profile && !profile.found_roommate && (
          <div className="mt-6 rounded-2xl glass p-4">
            <p className="mb-3 text-xs text-muted-foreground">Found a roommate? Hide your profile so people stop reaching out.</p>
            <Button variant="outline" onClick={() => toggleFound.mutate(true)} disabled={toggleFound.isPending} className="rounded-full">
              <EyeOff className="mr-2 h-4 w-4" /> Mark as found
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
