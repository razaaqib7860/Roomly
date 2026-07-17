export const BRANCHES = ["CSE", "ECE", "IT", "Other"] as const;
export const YEARS = ["1st", "2nd", "3rd", "4th", "MTech / PG"] as const;
export const BLOCKS = ["Block 1", "Block 2", "Block 3", "Block 4", "No preference"] as const;
export const ROOM_PREFS = ["Single sharing", "Double sharing", "No preference"] as const;

export const SLEEP_LABELS: Record<string, string> = {
  early_bird: "Early bird",
  night_owl: "Night owl",
  flexible: "Flexible",
};
export const SMOKE_LABELS: Record<string, string> = {
  no: "Non-smoker",
  occasional: "Occasional",
  yes: "Smoker",
};
export const GAMING_LABELS: Record<string, string> = {
  no: "Not into gaming",
  casual: "Casual gamer",
  hardcore: "Hardcore gamer",
};
