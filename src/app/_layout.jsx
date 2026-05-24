import "react-native-gesture-handler";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { COLORS } from "../../constants/theme";

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }) {
  const { user, booting } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (booting) return;

    const inAuthGroup =
      segments[0] === "(tabs)" ||
      segments[0] === "eventcreate" ||
      segments[0] === "eventDetails" ||
      segments[0] === "editevent" ||
      segments[0] === "eventhistory" ||
      segments[0] === "joinEvent" ||
      segments[0] === "eventParticipants";

    const atLanding =
      segments.length === 0 ||
      segments[0] === "index";

    if (!user && inAuthGroup) {
      router.replace("/");
    } else if (user && atLanding) {
      router.replace("/(tabs)/home");
    } else if (user && segments[0] === "login") {
      router.replace("/(tabs)/home");
    } else if (user && segments[0] === "register") {
      router.replace("/(tabs)/home");
    }
  }, [user, booting, segments]);

  if (booting) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return children;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthGate>
          <Toast />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
