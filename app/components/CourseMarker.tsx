import { memo } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { Marker } from "react-native-maps"

export interface CourseMarkerProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

const getMarkerImage = (holes: number) => {
  return holes >= 18
    ? require("../../assets/images/basket-marker-big.png")
    : require("../../assets/images/basket-marker-small.png")
}

export const CourseMarker = memo(({ course, onPress }: { course: any; onPress: () => void }) => {
  return (
    <Marker
      coordinate={{ latitude: course.lat, longitude: course.lng }}
      image={getMarkerImage(course.holes)}
      tracksViewChanges={false}
      onPress={onPress}
    />
  )
})

CourseMarker.displayName = "CourseMarker"
