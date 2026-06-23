import { FC } from "react"
import { ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"

interface ScoreScreenProps extends AppStackScreenProps<"Score"> {}

export const ScoreScreen: FC<ScoreScreenProps> = () => {
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top", "bottom"]}>
      <Text text="score" />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
