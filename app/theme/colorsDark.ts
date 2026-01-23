const palette = {
  // Tummat neutraalit: Syvä tummansininen/harmaa pohja
  neutral900: "#0F172A", // Tummin tausta
  neutral800: "#1E293B", // Kortit / elementit
  neutral700: "#334155", // Korostetut pinnat
  neutral600: "#475569",
  neutral500: "#64748B",
  neutral400: "#94A3B8",
  neutral300: "#CBD5E1",
  neutral200: "#E2E8F0",
  neutral100: "#F8FAFC", // Vaalein teksti

  // Primary: Vihreä säilyy, mutta sävyjä on säädetty hohtamaan paremmin tummalla
  primary600: "#052E16",
  primary500: "#16A34A",
  primary400: "#22C55E",
  primary300: "#4ADE80",
  primary200: "#86EFAC",
  primary100: "#DCFCE7",

  // Secondary: Oranssi toimii loistavasti tummassa tilassa huomiovärinä
  secondary500: "#FB923C",
  secondary400: "#F97316",
  secondary300: "#EA580C",
  secondary200: "#C2410C",
  secondary100: "#7C2D12",

  // Accent: Kulta/Keltainen
  accent500: "#FACC15",
  accent400: "#EAB308",
  accent300: "#CA8A04",
  accent200: "#A16207",
  accent100: "#713F12",

  angry100: "#450A0A",
  angry500: "#EF4444",

  overlay20: "rgba(0, 0, 0, 0.4)",
  overlay50: "rgba(0, 0, 0, 0.7)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",

  // Teksti on nyt vaaleaa
  text: palette.neutral100,
  textDim: palette.neutral400,

  // Tausta on tumma
  background: palette.neutral900,

  // Reunaviivat ja erottimet hieman vaaleampia kuin tausta
  border: palette.neutral700,

  // Korostusvärit
  tint: palette.primary400, // Hieman kirkkaampi vihreä kuin vaaleassa tilassa
  tintInactive: palette.neutral600,
  separator: palette.neutral800,

  error: palette.angry500,
  errorBackground: palette.angry100,
} as const
