import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "@/components/profile-form";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Complete your profile — Roomly" }, { name: "robots", content: "noindex" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["my-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existing?.onboarded) navigate({ to: "/browse" });
  }, [existing, navigate]);

  if (!userId || isLoading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto max-w-2xl px-4 pt-10 sm:pt-16">
        <div className="animate-float-up mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Step 1 of 1</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Complete your profile</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add a photo and a few details. Only same-year students will see this.
          </p>
        </div>
        <ProfileForm userId={userId} existing={existing ?? null} isOnboarding onDone={() => navigate({ to: "/browse" })} />
      </div>
    </div>
  );
}
