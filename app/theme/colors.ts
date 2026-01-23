const palette = {
  // Neutraalit: Poistettu ruskehtavuus, vaihdettu puhtaaseen "Slate" harmaaseen.
  // Tämä tekee sovelluksesta modernimman ja helpommin luettavan auringossa.
  neutral100: "#FFFFFF",
  neutral200: "#F1F5F9",
  neutral300: "#E2E8F0",
  neutral400: "#94A3B8",
  neutral500: "#64748B",
  neutral600: "#475569",
  neutral700: "#334155",
  neutral800: "#1E293B",
  neutral900: "#0F172A",

  // Primary: "Fairway Green" – Lajin ydinväri.
  // Toimii hyvin nappeihin ja brändielementteihin.
  primary100: "#DCFCE7",
  primary200: "#BBF7D0",
  primary300: "#86EFAC",
  primary400: "#4ADE80",
  primary500: "#22C55E", // Pääväri
  primary600: "#16A34A",

  // Secondary: "Disc Orange" – Erittäin hyvä kontrastiväri toimintopainikkeille.
  secondary100: "#FFEDD5",
  secondary200: "#FED7AA",
  secondary300: "#FDBA8C",
  secondary400: "#FB923C",
  secondary500: "#F97316", // Huomioväri
  secondary600: "#EA580C",

  // Accent: "Golden Birdie" – Käytetään erikoistilanteisiin tai korostuksiin.
  accent100: "#FEF9C3",
  accent200: "#FEF08A",
  accent300: "#FDE047",
  accent400: "#FACC15",
  accent500: "#EAB308",

  // Angry: Selkeä virheväri (Bogey/Error).
  angry100: "#FEE2E2",
  angry500: "#EF4444",

  overlay20: "rgba(15, 23, 42, 0.2)",
  overlay50: "rgba(15, 23, 42, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",

  // Teksti on nyt tumman laivastonsinistä/harmaata, mikä parantaa luettavuutta.
  text: palette.neutral900,
  textDim: palette.neutral600,

  // Tausta on erittäin vaalea harmaa, joka ei heijasta niin pahasti kuin puhdas valkoinen.
  background: palette.neutral100,
  border: palette.neutral300,

  // Tint on nyt dynaaminen vihreä.
  tint: palette.primary500,
  tintInactive: palette.neutral400,
  separator: palette.neutral200,

  error: palette.angry500,
  errorBackground: palette.angry100,
} as const
