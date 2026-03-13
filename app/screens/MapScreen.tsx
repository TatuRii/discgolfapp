import { FC, useEffect, useState, useRef, useMemo } from "react"
import { ActivityIndicator, View, ViewStyle, TextStyle } from "react-native"
import * as Location from "expo-location"
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps"
import Supercluster from "supercluster"

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
  lat: number
  lng: number
  [key: string]: any
}

export const MapScreen: FC = () => {
  const { themed, theme } = useAppTheme()
  const [courses, setCourses] = useState<Course[]>([])
  const [region, setRegion] = useState<Region>(DEFAULT_REGION)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const mapRef = useRef<MapView>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Alustetaan Supercluster
  const index = useMemo(() => {
    return new Supercluster({
      radius: 50, // Kuinka lähekkäin pisteiden pitää olla (pikseleinä)
      maxZoom: 16, // Tämän jälkeen ei enää clusteroida
    })
  }, [])

  // Muunnetaan kurssit GeoJSON-muotoon Superclusteria varten
  const points = useMemo(() => {
    return courses.map((course) => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        courseId: course.id,
        course,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [course.lng, course.lat],
      },
    }))
  }, [courses])

  // Ladataan pisteet indeksiin
  useEffect(() => {
    index.load(points)
  }, [points, index])

  // Lasketaan näkyvät clusterit
  const clusters = useMemo(() => {
    // TÄRKEÄÄ: Jos pisteitä ei ole vielä ladattu, palautetaan tyhjä taulukko
    // Tämä estää "Cannot read property 'range' of undefined" -virheen
    if (points.length === 0) return []

    try {
      if (!(index as any).stride) return []
      const bbox = [
        region.longitude - region.longitudeDelta / 2,
        region.latitude - region.latitudeDelta / 2,
        region.longitude + region.longitudeDelta / 2,
        region.latitude + region.latitudeDelta / 2,
      ] as [number, number, number, number]

      // Lasketaan zoom-taso (varmistetaan välille 0-20)
      let zoom = Math.round(Math.log2(360 / region.longitudeDelta))
      zoom = Math.max(0, Math.min(zoom, 20))

      return index.getClusters(bbox, zoom)
    } catch (e) {
      console.warn("Clusterointi epäonnistui:", e)
      return []
    }
  }, [region, points, index])

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
      <MapView
        ref={mapRef}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        style={$mapStyle}
        provider={PROVIDER_GOOGLE}
        onPress={() => setSelectedCourse(null)}
      >
        {clusters.map((cluster, i) => {
          const [longitude, latitude] = cluster.geometry.coordinates
          const { cluster: isCluster, point_count: pointCount } = cluster.properties

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id || i}`} // Käytetään i:tä fallbackina
                coordinate={{ latitude, longitude }}
                onPress={() => {
                  try {
                    // TURVALLISEMPI TAPA ZOOMATA:
                    // Lasketaan uusi zoom-taso nykyisestä deltasta
                    // Jos haluat silti kokeilla expansionZoomia, kääri se try-catchiin:
                    const currentZoom = Math.round(Math.log2(360 / region.longitudeDelta))
                    let nextZoom = currentZoom + 2

                    try {
                      if (cluster.id) {
                        nextZoom = Math.min(index.getClusterExpansionZoom(cluster.id as number), 16)
                      }
                    } catch {
                      // Jos cluster ID on ehtinyt vanhentua, käytetään fallback-zoomia
                      console.log("Cluster ID ei enää voimassa, käytetään fallback-zoomia")
                    }

                    const zoomDeltaFactor = Math.pow(2, currentZoom - nextZoom)

                    mapRef.current?.animateToRegion(
                      {
                        latitude,
                        longitude,
                        latitudeDelta: region.latitudeDelta * zoomDeltaFactor,
                        longitudeDelta: region.longitudeDelta * zoomDeltaFactor,
                      },
                      300,
                    )
                  } catch (error) {
                    console.warn("Zoom epäonnistui", error)
                  }
                }}
              >
                <View style={themed($clusterContainer)}>
                  <Text text={`${pointCount}`} style={$clusterText} />
                </View>
              </Marker>
            )
          }

          return (
            <CourseMarker
              key={`course-${cluster.properties.courseId}`}
              course={cluster.properties.course}
              onPress={() => setSelectedCourse(cluster.properties.course)}
            />
          )
        })}
      </MapView>

      {selectedCourse && (
        <View style={themed($bottomSheet)}>
          <Text text={selectedCourse.name} style={themed($courseName)} />
          <Text text={`${selectedCourse.holes} väylää`} style={themed($courseHoles)} />
        </View>
      )}
    </View>
  )
}

const $container: ViewStyle = { flex: 1 }
const $mapStyle: ViewStyle = { flex: 1 }

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $clusterContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.palette.primary500,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "white",
})

const $clusterText: TextStyle = {
  color: "white",
  fontWeight: "bold",
  fontSize: 10,
}

const $bottomSheet: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  bottom: spacing.lg,
  left: spacing.md,
  right: spacing.md,
  backgroundColor: colors.background,
  padding: spacing.md,
  borderRadius: 16,
  elevation: 5,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
})

const $courseName: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 18,
})

const $courseHoles: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 14,
})
