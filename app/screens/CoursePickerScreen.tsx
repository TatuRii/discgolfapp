import { FC, useEffect, useState, useCallback } from "react"
import { ActivityIndicator, FlatList, Pressable, View, ViewStyle, TextStyle } from "react-native"
import * as Location from "expo-location"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { supabase } from "@/lib/supabase"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

// Tampere fallback jos sijaintilupa evätään
const FALLBACK = { latitude: 61.4991, longitude: 23.7871 }
const SEARCH_RADIUS_DEG = 2.5 // ~250 km, haetaan reilusti

interface Course {
  id: string
  name: string
  holes: number
  lat: number
  lng: number
  [key: string]: any
}

interface CourseWithDistance extends Course {
  distanceKm: number
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface CoursePickerScreenProps extends AppStackScreenProps<"CoursePicker"> {}

export const CoursePickerScreen: FC<CoursePickerScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const [courses, setCourses] = useState<CourseWithDistance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [locationDenied, setLocationDenied] = useState(false)
  const [_userLocation, setUserLocation] = useState(FALLBACK)

  const fetchNearestCourses = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true)
    const { data, error } = await supabase.rpc("get_courses_in_view", {
      min_lat: lat - SEARCH_RADIUS_DEG,
      max_lat: lat + SEARCH_RADIUS_DEG,
      min_lng: lng - SEARCH_RADIUS_DEG,
      max_lng: lng + SEARCH_RADIUS_DEG,
    })

    if (!error && data) {
      const withDistance: CourseWithDistance[] = data
        .map((course: Course) => ({
          ...course,
          distanceKm: haversineKm(lat, lng, course.lat, course.lng),
        }))
        .sort((a: CourseWithDistance, b: CourseWithDistance) => a.distanceKm - b.distanceKm)
        .slice(0, 50)

      setCourses(withDistance)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({})
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
          setUserLocation(coords)
          await fetchNearestCourses(coords.latitude, coords.longitude)
        } else {
          setLocationDenied(true)
          await fetchNearestCourses(FALLBACK.latitude, FALLBACK.longitude)
        }
      } catch {
        setLocationDenied(true)
        await fetchNearestCourses(FALLBACK.latitude, FALLBACK.longitude)
      }
    })()
  }, [fetchNearestCourses])

  const handleSelect = (course: CourseWithDistance) => {
    navigation.navigate("Score", {
      courseId: course.id,
      courseName: course.name,
      holes: course.holes,
    })
  }

  const renderItem = ({ item }: { item: CourseWithDistance; index: number }) => (
    <Pressable
      style={({ pressed }) => [themed($courseRow), pressed && themed($courseRowPressed)]}
      onPress={() => handleSelect(item)}
      android_ripple={{ color: theme.colors.palette.primary100 }}
    >
      <View style={$rowMiddle}>
        <Text style={themed($courseName)} text={item.name} numberOfLines={1} />
        <Text style={themed($courseDetail)} text={`${item.holes} holes`} />
      </View>
      <View style={$rowRight}>
        <Text
          style={themed($distanceText)}
          text={
            item.distanceKm < 1
              ? `${Math.round(item.distanceKm * 1000)} m`
              : `${item.distanceKm.toFixed(0)} km`
          }
        />
      </View>
    </Pressable>
  )

  return (
    <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
      {locationDenied && (
        <View style={themed($locationBanner)}>
          <Text
            style={themed($locationBannerText)}
            text="Location not available – showing closest courses from Tampere"
          />
        </View>
      )}

      {isLoading ? (
        <View style={$centered}>
          <ActivityIndicator color={theme.colors.palette.primary500} size="large" />
          <Text style={themed($loadingText)} text="Fetching closest courses…" />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={$listContent}
          ItemSeparatorComponent={() => <View style={themed($separator)} />}
          ListEmptyComponent={
            <View style={$centered}>
              <Text style={themed($emptyText)} text="No courses found in your area." />
            </View>
          }
          ListHeaderComponent={
            <View style={themed($listHeader)}>
              <Text
                style={themed($listHeaderText)}
                text={`Closest Courses to you${locationDenied ? " (Tampere)" : ""}`}
              />
            </View>
          }
        />
      )}
    </Screen>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const $root: ViewStyle = { flex: 1 }
const $centered: ViewStyle = { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }
const $listContent: ViewStyle = { paddingBottom: 32 }

const $rowMiddle: ViewStyle = { flex: 1 }
const $rowRight: ViewStyle = { alignItems: "flex-end", minWidth: 56 }

const $locationBanner: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $locationBannerText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral600,
  fontSize: 12,
  fontFamily: typography.primary.normal,
})

const $listHeader: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
})

const $listHeaderText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 20,
  color: colors.text,
})

const $courseRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.background,
  gap: spacing.sm,
})

const $courseRowPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
})

const $courseName: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 15,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

const $courseDetail: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.palette.neutral500,
  fontFamily: typography.primary.normal,
  marginTop: 1,
})

const $distanceText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 13,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $separator: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.separator,
  marginLeft: 36 + 16, // kohdistuu tekstin kanssa
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral600,
  fontFamily: typography.primary.normal,
  fontSize: 14,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral500,
  fontFamily: typography.primary.normal,
  fontSize: 15,
})
