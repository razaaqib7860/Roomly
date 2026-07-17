const KEY = "iiitr_roommate_profile";

export type StoredProfile = { id: string; token: string };

export function getStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

export function setStoredProfile(p: StoredProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearStoredProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
