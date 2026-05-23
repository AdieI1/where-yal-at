import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { COLORS } from "../../constants/theme";
import { authApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

const logo = require("../../assets/images/WYA-LOGO.png");

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = (msg) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      toast("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login({
        email: email.trim(),
        password,
      });
      await signIn(data.token, data.user);
      router.replace("/(tabs)/home");
    } catch (e) {
      toast(e.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkGreen} />
        </TouchableOpacity>

        <Image source={logo} style={styles.logo} />

        <Text style={styles.title}>WELCOME BACK!</Text>
        <Text style={styles.subtitle}>
          Don't have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.replace("/register")}
          >
            Sign up
          </Text>
        </Text>

        <Text style={styles.label}>Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g. john.doe23@gmail.com"
          placeholderTextColor="#AAA58F"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password:</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter your password"
            placeholderTextColor="#AAA58F"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eye}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  back: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: "70%",
    height: 80,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.darkGreen,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginBottom: 24,
    marginTop: 6,
  },
  link: {
    fontWeight: "800",
    color: COLORS.darkGreen,
    textDecorationLine: "underline",
  },
  label: {
    fontWeight: "700",
    color: COLORS.darkGreen,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    color: "#333",
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eye: { padding: 10, marginLeft: -48 },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  forgot: { alignItems: "center", marginTop: 16 },
  forgotText: {
    color: COLORS.darkGreen,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
