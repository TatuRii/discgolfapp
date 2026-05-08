import { FC } from "react"
import { ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"

interface CoursePickerScreenProps extends AppStackScreenProps<"CoursePicker"> {}

export const CoursePickerScreen: FC<CoursePickerScreenProps> = () => {
  return (
    <Screen style={$root} preset="scroll">
      <Text text="coursePicker" />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
