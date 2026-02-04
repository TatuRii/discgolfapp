import { FC } from "react"
import { ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
// import { useNavigation } from "@react-navigation/native"

interface MoreScreenProps extends AppStackScreenProps<"More"> {}

export const MoreScreen: FC<MoreScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  const { themed } = useAppTheme()
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <Text preset="heading" text="More" />
      <Text preset="subheading" text="Practice" />
      <Button style={themed($button)} pressedStyle={themed($buttonPressed)} text="Putt practice" />
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
