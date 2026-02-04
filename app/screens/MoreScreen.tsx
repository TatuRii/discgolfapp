import { FC } from "react"
import { ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface MoreScreenProps extends AppStackScreenProps<"More"> {}

export const MoreScreen: FC<MoreScreenProps> = ({ navigation }) => {
  const { themed } = useAppTheme()

  const onPuttPracticePress = () => {
    navigation.navigate("PuttPractice")
  }
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <Text preset="heading" text="More" />
      <Text preset="subheading" text="Practice" />
      <Button
        style={themed($button)}
        pressedStyle={themed($buttonPressed)}
        text="Putt practice"
        onPress={onPuttPracticePress}
      />
    </Screen>
  )
}

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginTop: spacing.md,
})
const $buttonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tintInactive,
})

const $root: ViewStyle = {
  flex: 1,
}
