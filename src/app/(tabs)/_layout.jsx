import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  Dimensions,
  Platform,
} from "react-native";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const { width, height } = Dimensions.get("window");

  const renderTabIcon = (iconName, label, focused) => (
    <View
      style={{
        width: width * 0.20,
        height: height * 0.07,
        borderRadius: width * 0.05,
        backgroundColor: focused ? "#8BCB74" : "transparent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons
        name={iconName}
        size={width * 0.06}
        color={focused ? "#FFFFFF" : "#8D9985"}
      />

      <Text
        style={{
          marginTop: height * 0.003,
          fontSize: width * 0.038,
          fontWeight: focused ? "700" : "500",
          color: focused ? "#FFFFFF" : "#8D9985",
        }}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,

          height:
            Platform.OS === "ios"
              ? height * 0.1 + insets.bottom
              : height * 0.09 + insets.bottom,

          backgroundColor: "#F5F2E9",

          borderTopWidth: 1,
          borderTopColor: "#E4DFD3",

          elevation: 0,
          shadowOpacity: 0,

          paddingTop: height * 0.02,
          paddingBottom: insets.bottom,
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        sceneContainerStyle: {
          backgroundColor: "#EDEDED",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) =>
            renderTabIcon("home", "Home", focused),
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ focused }) =>
            renderTabIcon("calendar-outline", "Events", focused),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) =>
            renderTabIcon("person", "Profile", focused),
        }}
      />
    </Tabs>
  );
}