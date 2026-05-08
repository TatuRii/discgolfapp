import { FC } from "react"
import { ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
  const { themed } = useAppTheme()

  const handleClick = () => {
    navigation.navigate("CoursePicker")
  }
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <Text text="Home" preset="heading" />
      <Button
        style={themed($button)}
        text="Start new round"
        onPress={handleClick}
        pressedStyle={themed($buttonPressed)}
      />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginTop: spacing.md,
})
const $buttonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tintInactive,
})
