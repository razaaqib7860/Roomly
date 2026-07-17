import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadProfilePhoto } from "@/lib/photo";
import { toast } from "sonner";
import { ProfilePhoto } from "./profile-photo";

export function PhotoUpload({
  userId,
  currentPath,
  name,
  onUploaded,
}: {
  userId: string;
  currentPath: string | null;
  name: string;
  onUploaded: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [path, setPath] = useState<string | null>(currentPath);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Please pick an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    setUploading(true);
    try {
      const p = await uploadProfilePhoto(userId, file);
      setPath(p);
      onUploaded(p);
      toast.success("Photo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative"
        disabled={uploading}
      >
        <ProfilePhoto path={path} name={name} size="xl" className="ring-2 ring-primary/30 transition group-hover:ring-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-medium text-primary hover:underline"
      >
        {path ? "Change photo" : "Upload photo *"}
      </button>
    </div>
  );
}
