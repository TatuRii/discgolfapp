import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { HomeScreen } from "@/screens/HomeScreen"

export type BottomNavigatorParamList = {
  Home: undefined
}

const Tab = createNativeStackNavigator<BottomNavigatorParamList>()
export const BottomNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{ contentStyle: { backgroundColor: "transparent" }, headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  )
}
