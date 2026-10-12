// src/config/avatars.ts
export type PresetAvatar = {
  id: string;
  bg: string;
  fg: string;
  label: string;
};

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "rose", bg: "#F43F5E", fg: "#FFFFFF", label: "Rose" },
  { id: "indigo", bg: "#6366F1", fg: "#FFFFFF", label: "Indigo" },
  { id: "emerald", bg: "#10B981", fg: "#FFFFFF", label: "Emerald" },
  { id: "amber", bg: "#F59E0B", fg: "#FFFFFF", label: "Amber" },
  { id: "sky", bg: "#0EA5E9", fg: "#FFFFFF", label: "Sky" },
  { id: "violet", bg: "#8B5CF6", fg: "#FFFFFF", label: "Violet" },
  { id: "slate", bg: "#475569", fg: "#FFFFFF", label: "Slate" },
  { id: "pink", bg: "#EC4899", fg: "#FFFFFF", label: "Pink" },
];
