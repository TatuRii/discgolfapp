import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { HomeScreen } from "@/screens/HomeScreen"
import { MapScreen } from "@/screens/MapScreen"
import { MoreScreen } from "@/screens/MoreScreen"
import { ProfileScreen } from "@/screens/ProfileScreen"

export type BottomNavigatorParamList = {
  Home: undefined
  Map: undefined
  Profile: undefined
  More: undefined
}

const Tab = createNativeStackNavigator<BottomNavigatorParamList>()
export const BottomNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{ contentStyle: { backgroundColor: "transparent" }, headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  )
}
