import { FC, useMemo, useState } from "react"
import { Modal, Pressable, ScrollView, View, ViewStyle, TextStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

const DEFAULT_PAR = 3
const MAX_STROKES = 15

interface HoleScore {
  par: number
  strokes: number | null
}

interface ScoreScreenProps extends AppStackScreenProps<"Score"> {}

export const ScoreScreen: FC<ScoreScreenProps> = ({ route, navigation }) => {
  const { themed, theme } = useAppTheme()
  const { courseId, courseName, holes } = route.params

  const [scores, setScores] = useState<HoleScore[]>(() =>
    Array.from({ length: holes }, () => ({ par: DEFAULT_PAR, strokes: null })),
  )
  const [activeHole, setActiveHole] = useState<number | null>(null)

  const totals = useMemo(() => {
    const played = scores.filter((s) => s.strokes !== null)
    const strokes = played.reduce((sum, s) => sum + (s.strokes ?? 0), 0)
    const par = played.reduce((sum, s) => sum + s.par, 0)
    return { strokes, toPar: strokes - par, playedCount: played.length }
  }, [scores])

  const allFilled = scores.every((s) => s.strokes !== null)

  const updateHole = (index: number, patch: Partial<HoleScore>) => {
    setScores((prev) => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)))
  }

  // Returns a fill color only for birdie-or-better / bogey-or-worse.
  // Par holes get no fill — just the plain number on an outlined circle.
  const relativeColor = (par: number, strokes: number | null) => {
    if (strokes === null) return null
    const diff = strokes - par
    if (diff <= -1) return theme.colors.palette.primary500 // birdie or better
    if (diff >= 1) return theme.colors.palette.angry500 // bogey or worse
    return null // par
  }

  const handleFinish = () => {
    // TODO: persist `scores` (courseId, per-hole par/strokes) to Supabase
    navigation.goBack()
  }

  return (
    <Screen style={$root} preset="fixed" safeAreaEdges={["top", "bottom"]}>
      <View style={themed($header)}>
        <Text style={themed($courseName)} text={courseName} numberOfLines={1} />
        <Text
          style={themed($totalsText)}
          text={
            totals.playedCount > 0
              ? `${totals.strokes} strokes · ${
                  totals.toPar === 0 ? "E" : totals.toPar > 0 ? `+${totals.toPar}` : totals.toPar
                } · ${totals.playedCount}/${holes} holes`
              : `${holes} holes`
          }
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$scrollContent}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={themed($holeStrip)}
        >
          {scores.map((hole, index) => {
            const color = relativeColor(hole.par, hole.strokes)
            const isFilled = hole.strokes !== null

            return (
              <Pressable
                key={index}
                style={$holeColumn}
                onPress={() => setActiveHole(index)}
                android_ripple={{ color: theme.colors.palette.primary100 }}
              >
                <Text style={themed($holeNumber)} text={String(index + 1)} />
                <Text style={themed($holePar)} text={`par ${hole.par}`} />
                <View
                  style={[
                    $scoreCircleShape,
                    {
                      backgroundColor: color ?? "transparent",
                      borderColor: color ?? theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={themed($scoreCircleTextShape)}
                    text={isFilled ? String(hole.strokes) : ""}
                  />
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      </ScrollView>

      <View style={themed($footer)}>
        <Pressable
          style={[themed($finishButton), !allFilled && $finishButtonDisabled]}
          onPress={handleFinish}
          disabled={!allFilled}
        >
          <Text style={themed($finishButtonText)} text="Finish round" />
        </Pressable>
      </View>

      <ScorePadModal
        visible={activeHole !== null}
        hole={activeHole}
        holeCount={holes}
        current={activeHole !== null ? scores[activeHole] : null}
        onChangePar={(delta) => {
          if (activeHole === null) return
          const next = Math.min(6, Math.max(2, scores[activeHole].par + delta))
          updateHole(activeHole, { par: next })
        }}
        onSetStrokes={(n) => {
          if (activeHole === null) return
          updateHole(activeHole, { strokes: n })
          setActiveHole(null) // close immediately after picking a score
        }}
        onPrev={() => setActiveHole((h) => (h !== null && h > 0 ? h - 1 : h))}
        onNext={() => setActiveHole((h) => (h !== null && h < holes - 1 ? h + 1 : h))}
        onClose={() => setActiveHole(null)}
      />
    </Screen>
  )
}

// ─── Score pad modal ────────────────────────────────────────────────────────

interface ScorePadModalProps {
  visible: boolean
  hole: number | null
  holeCount: number
  current: HoleScore | null
  onChangePar: (delta: number) => void
  onSetStrokes: (n: number) => void
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}

const ScorePadModal: FC<ScorePadModalProps> = ({
  visible,
  hole,
  holeCount,
  current,
  onChangePar,
  onSetStrokes,
  onPrev,
  onNext,
  onClose,
}) => {
  const { themed, theme, themeContext } = useAppTheme()
  const isDark = themeContext === "dark"
  // Surface color for the pad keys / par pills — pick explicitly per theme
  // rather than a fixed neutral shade, since the neutral scale's light/dark
  // ends flip meaning between the two palettes.
  const keySurface = isDark ? theme.colors.palette.neutral800 : theme.colors.palette.neutral200

  if (hole === null || current === null) return null

  const diff = current.strokes !== null ? current.strokes - current.par : null
  const diffLabel =
    diff === null
      ? ""
      : diff === 0
        ? "Par"
        : diff < 0
          ? diff === -1
            ? "Birdie"
            : "Eagle+"
          : `+${diff}`

  const padNumbers = Array.from({ length: MAX_STROKES }, (_, i) => i + 1)

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={$backdrop} onPress={onClose} />
      <View style={themed($sheet)}>
        <View style={$sheetHandle} />

        <View style={themed($sheetHeaderRow)}>
          <Pressable onPress={onPrev} disabled={hole === 0} hitSlop={12}>
            <Text style={[themed($sheetNavArrow), hole === 0 && $sheetNavArrowDisabled]} text="‹" />
          </Pressable>

          <View style={$sheetHeaderCenter}>
            <Text style={themed($sheetHoleLabel)} text={`Hole ${hole + 1}`} />
            <View style={$parAdjustRow}>
              <Pressable
                onPress={() => onChangePar(-1)}
                hitSlop={8}
                style={[$parPill, { backgroundColor: keySurface }]}
              >
                <Text style={themed($parPillText)} text="–" />
              </Pressable>
              <Text style={themed($parText)} text={`Par ${current.par}`} />
              <Pressable
                onPress={() => onChangePar(1)}
                hitSlop={8}
                style={[$parPill, { backgroundColor: keySurface }]}
              >
                <Text style={themed($parPillText)} text="+" />
              </Pressable>
            </View>
          </View>

          <Pressable onPress={onNext} disabled={hole === holeCount - 1} hitSlop={12}>
            <Text
              style={[themed($sheetNavArrow), hole === holeCount - 1 && $sheetNavArrowDisabled]}
              text="›"
            />
          </Pressable>
        </View>

        <View style={$sheetScoreDisplay}>
          <Text
            style={themed($sheetScoreValue)}
            text={current.strokes === null ? "–" : String(current.strokes)}
          />
          {diffLabel !== "" && <Text style={themed($sheetDiffLabel)} text={diffLabel} />}
        </View>

        <View style={$padGrid}>
          {padNumbers.map((n) => {
            const selected = current.strokes === n
            return (
              <Pressable
                key={n}
                style={[
                  $padKey,
                  { backgroundColor: keySurface },
                  selected && themed($padKeySelected),
                ]}
                onPress={() => onSetStrokes(n)}
                android_ripple={{ color: theme.colors.palette.primary100 }}
              >
                <Text
                  style={[themed($padKeyText), selected && $padKeyTextSelected]}
                  text={String(n)}
                />
              </Pressable>
            )
          })}
        </View>
      </View>
    </Modal>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const $root: ViewStyle = { flex: 1 }
const $scrollContent: ViewStyle = { flexGrow: 1 }

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
})

const $courseName: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 20,
  color: colors.text,
})

const $totalsText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.textDim,
  marginTop: 2,
})

const $holeStrip: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.md,
  gap: 4,
})

const $holeColumn: ViewStyle = {
  width: 52,
  alignItems: "center",
  gap: 6,
  paddingVertical: 4,
}

const $holeNumber: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 15,
  color: colors.text,
})

const $holePar: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 10,
  color: colors.textDim,
})

const $scoreCircleShape: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  borderWidth: 1.5,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 2,
}

const $scoreCircleTextShape: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontFamily: "System",
  fontWeight: "700",
  fontSize: 16,
  color: colors.text,
})

const $footer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
})

const $finishButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.sm,
  borderRadius: 10,
  alignItems: "center",
  backgroundColor: colors.palette.primary500,
})

const $finishButtonDisabled: ViewStyle = { opacity: 0.4 }

const $finishButtonText: ThemedStyle<TextStyle> = () => ({
  fontFamily: "System",
  fontWeight: "600",
  fontSize: 15,
  color: "#FFFFFF",
})

// Modal styles

const $backdrop: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
}

const $sheet: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
  gap: spacing.md,
})

const $sheetHandle: ViewStyle = {
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: "#00000020",
  alignSelf: "center",
  marginBottom: 8,
}

const $sheetHeaderRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $sheetHeaderCenter: ViewStyle = { alignItems: "center", gap: 4 }

const $sheetHoleLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 18,
  color: colors.text,
})

const $sheetNavArrow: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 32,
  color: colors.palette.primary500,
  fontWeight: "300",
  width: 40,
  textAlign: "center",
})

const $sheetNavArrowDisabled: TextStyle = { opacity: 0.25 }

const $parAdjustRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10 }

// Shape only — background is applied inline per-theme via `keySurface`.
const $parPill: ViewStyle = {
  width: 22,
  height: 22,
  borderRadius: 11,
  justifyContent: "center",
  alignItems: "center",
}

const $parPillText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "700",
  color: colors.text,
})

const $parText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.textDim,
  minWidth: 46,
  textAlign: "center",
})

const $sheetScoreDisplay: ViewStyle = { alignItems: "center", gap: 2 }

const $sheetScoreValue: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 64,
  color: colors.text,
})

const $sheetDiffLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.palette.primary500,
})

const $padGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 12,
}

// Shape only — background is applied inline per-theme via `keySurface`.
const $padKey: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
}

const $padKeySelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
})

const $padKeyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontFamily: "System",
  fontWeight: "700",
  fontSize: 20,
  color: colors.text,
})

const $padKeyTextSelected: TextStyle = { color: "#FFFFFF" }
