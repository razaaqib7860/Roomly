import { useEffect, useState } from "react";
import { signPhoto } from "@/lib/photo";

export function ProfilePhoto({
  path,
  name,
  size = "lg",
  className = "",
}: {
  path: string | null | undefined;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancel = false;
    setError(false);
    if (!path) { setUrl(null); return; }
    signPhoto(path).then((u) => { if (!cancel) setUrl(u); });
    return () => { cancel = true; };
  }, [path]);

  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";
const dims = {
  sm: "h-10 w-10 text-sm",
  md: "h-16 w-16 text-lg",
  lg: "h-28 w-28 text-3xl",
  xl: "h-48 w-48 text-5xl",
}[size];
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 ${dims} ${className}`}>
      {url && !error ? (
        <img
          src={url}
          alt={name}
          loading="lazy"
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display font-semibold text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
          {initials}
        </div>
      )}
    </div>
  );
}
