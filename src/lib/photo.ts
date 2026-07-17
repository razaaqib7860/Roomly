import { supabase } from "@/integrations/supabase/client";

export const PHOTO_BUCKET = "profile-photos";

export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

/** Returns a long-lived signed URL for private bucket display. */
// export async function signPhoto(path: string | null | undefined): Promise<string | null> {
//   if (!path) return null;
//   const { data, error } = await supabase.storage
//     .from(PHOTO_BUCKET)
//     .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
//   if (error) return null;
//   return data.signedUrl;
// }
export async function signPhoto(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;

  const { data } = supabase.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
