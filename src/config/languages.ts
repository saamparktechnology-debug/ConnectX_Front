// src/config/languages.ts
/**
 * Languages master list — mirrors Backend/src/db seed.
 * TODO (M6): replace with GET /languages once the endpoint exists.
 */

export type Language = {
  code: string;
  name: string;
};

export const LANGUAGES: Language[] = [
  { code: "hi", name: "Hindi" },
  { code: "en", name: "English" },
  { code: "bn", name: "Bengali" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" },
  { code: "or", name: "Odia" },
  { code: "as", name: "Assamese" },
  { code: "ur", name: "Urdu" },
];

export function findLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
