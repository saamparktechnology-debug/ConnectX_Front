// LOGIC PRESERVED: same token names (rose, primary, etc.) so no other file breaks.

export type ThemeColors = {
  bg: string;
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  bgElevated: string;
  surface: string;
  surfaceRaised: string;
  surfacePressed: string;

  border: string;
  borderStrong: string;
  divider: string;

  rose: string;
  rosePressed: string;
  roseSoft: string;
  roseContrast: string;

  primary: string;
  primaryPressed: string;
  primarySoft: string;
  primaryContrast: string;

  chipActiveStart: string;
  chipActiveEnd: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textOnRose: string;
  textOnPrimary: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  gold: string;

  online: string;
  busy: string;
  offline: string;

  overlay: string;
  skeleton: string;
  skeletonShine: string;
};

export const darkColors: ThemeColors = {
  bg: "#0F1015",
  bgTop: "#0F1015",
  bgMid: "#0F1015",
  bgBottom: "#0F1015",
  bgElevated: "#1A1B22",
  surface: "#1A1B22",
  surfaceRaised: "#232530",
  surfacePressed: "#2A2C38",

  border: "#2A2C38",
  borderStrong: "#3A3D4D",
  divider: "#22242E",

  rose: "#3B6DF5",
  rosePressed: "#2A5AE0",
  roseSoft: "#1C2A4D",
  roseContrast: "#FFFFFF",

  primary: "#3B6DF5",
  primaryPressed: "#2A5AE0",
  primarySoft: "#1C2A4D",
  primaryContrast: "#FFFFFF",

  chipActiveStart: "#E8457C",
  chipActiveEnd: "#C226A4",

  textPrimary: "#F5F6FA",
  textSecondary: "#A8ABBD",
  textMuted: "#6B6E82",
  textDisabled: "#454857",
  textOnRose: "#FFFFFF",
  textOnPrimary: "#FFFFFF",

  success: "#22C55E",
  successSoft: "#0E2A1A",
  warning: "#FBBF24",
  warningSoft: "#2A1F08",
  danger: "#EF4444",
  dangerSoft: "#2A0E0E",
  info: "#3B6DF5",
  infoSoft: "#1C2A4D",
  gold: "#FBBF24",

  online: "#22C55E",
  busy: "#F59E0B",
  offline: "#6B6E82",

  overlay: "rgba(0,0,0,0.7)",
  skeleton: "#232530",
  skeletonShine: "#2F3240",
};

export const lightColors: ThemeColors = {
  bg: "#F5E6F0",
  bgTop: "#FBE5E0",
  bgMid: "#F5E6F0",
  bgBottom: "#E4E7F5",
  bgElevated: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceRaised: "#F5F6FA",
  surfacePressed: "#EFF1F7",

  border: "#E8E9F0",
  borderStrong: "#D5D7E0",
  divider: "#EFF1F7",

  rose: "#3B6DF5",
  rosePressed: "#2A5AE0",
  roseSoft: "#EEF3FF",
  roseContrast: "#FFFFFF",

  primary: "#3B6DF5",
  primaryPressed: "#2A5AE0",
  primarySoft: "#EEF3FF",
  primaryContrast: "#FFFFFF",

  chipActiveStart: "#E8457C",
  chipActiveEnd: "#C226A4",

  textPrimary: "#0F1015",
  textSecondary: "#6B6E82",
  textMuted: "#9A9DAD",
  textDisabled: "#C7CAD5",
  textOnRose: "#FFFFFF",
  textOnPrimary: "#FFFFFF",

  success: "#22C55E",
  successSoft: "#DCFCE7",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
  info: "#3B6DF5",
  infoSoft: "#EEF3FF",
  gold: "#FBBF24",

  online: "#22C55E",
  busy: "#F59E0B",
  offline: "#9A9DAD",

  overlay: "rgba(0,0,0,0.5)",
  skeleton: "#EEF0F5",
  skeletonShine: "#F7F8FB",
};
