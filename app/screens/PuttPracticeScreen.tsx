import { FC } from "react"
import { ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
// import { useNavigation } from "@react-navigation/native"

interface PuttPracticeScreenProps extends AppStackScreenProps<"PuttPractice"> {}

export const PuttPracticeScreen: FC<PuttPracticeScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <Text preset="heading" text="Jyly" />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
