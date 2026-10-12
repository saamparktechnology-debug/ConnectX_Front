// LOGIC PRESERVED: same exported tokens (spacing, radius, typography, shadows).
// VISUAL CHANGES: slightly bolder headings matching the Connecto look.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 28,
  full: 9999,
} as const;

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800" as const,
    letterSpacing: -0.4,
  },
  h1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
  },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "800" as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "700" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "500" as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: "700" as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "600" as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const },
  mono: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
} as const;

export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;
