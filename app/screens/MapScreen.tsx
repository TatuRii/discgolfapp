import { FC } from "react"
import { ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
// import { useNavigation } from "@react-navigation/native"

interface MapScreenProps extends AppStackScreenProps<"Map"> {}

export const MapScreen: FC<MapScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <Text text="map" />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
