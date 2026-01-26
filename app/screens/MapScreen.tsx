import { FC, useEffect, useState, useRef } from "react"
import { ActivityIndicator, View, ViewStyle, TextStyle } from "react-native"
import * as Location from "expo-location"
import MapViewClustering from "react-native-map-clustering"
import { PROVIDER_GOOGLE, Region } from "react-native-maps"

import { CourseMarker } from "@/components/CourseMarker"
import { Text } from "@/components/Text"
import { supabase } from "@/lib/supabase"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

const DEFAULT_REGION: Region = {
  latitude: 61.4991,
  longitude: 23.7871,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
}

interface Course {
  id: string
  name: string
  holes: number
  [key: string]: unknown
}

export const MapScreen: FC = () => {
  const { themed, theme } = useAppTheme()
  const [courses, setCourses] = useState<Course[]>([])
  const [region, setRegion] = useState<Region>(DEFAULT_REGION)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const mapRef = useRef<MapViewClustering>(null)
  const debounceTimer = useRef<number | null>(null)

  const fetchCourses = async (currentRegion: Region) => {
    const minLat = currentRegion.latitude - currentRegion.latitudeDelta / 2
    const maxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2
    const minLng = currentRegion.longitude - currentRegion.longitudeDelta / 2
    const maxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2

    const { data, error } = await supabase.rpc("get_courses_in_view", {
      min_lat: minLat,
      max_lat: maxLat,
      min_lng: minLng,
      max_lng: maxLng,
    })

    if (!error && data) {
      setCourses(data)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({})
          const initial = {
            ...DEFAULT_REGION,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          }
          setRegion(initial)
          fetchCourses(initial)
        } else {
          fetchCourses(DEFAULT_REGION)
        }
      } catch {
        fetchCourses(DEFAULT_REGION)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchCourses(newRegion)
    }, 400)
  }

  if (isLoading) {
    return (
      <View style={themed($loadingContainer)}>
        <ActivityIndicator color={theme.colors.palette.primary500} />
      </View>
    )
  }

  return (
    <View style={themed($container)}>
      <MapViewClustering
        ref={mapRef}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        style={$mapStyle}
        provider={PROVIDER_GOOGLE}
        clusterColor={theme.colors.palette.primary500}
        onPress={() => setSelectedCourse(null)}
      >
        {courses.map((course) => (
          <CourseMarker key={course.id} course={course} onPress={() => setSelectedCourse(course)} />
        ))}
      </MapViewClustering>

      {selectedCourse && (
        <View style={themed($bottomSheet)}>
          <Text text={selectedCourse.name} style={themed($courseName)} />
          <Text text={`${selectedCourse.holes} väylää`} style={themed($courseHoles)} />
        </View>
      )}
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $mapStyle: ViewStyle = {
  flex: 1,
}

const $bottomSheet: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  bottom: spacing.lg,
  left: spacing.md,
  right: spacing.md,
  backgroundColor: colors.background,
  padding: spacing.md,
  borderRadius: 16,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 5,
})

const $courseName: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 18,
})

const $courseHoles: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 14,
})
