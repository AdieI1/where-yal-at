import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

export default function Register() {
  const { signIn } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = (msg) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      await signIn(data.token, data.user);
      router.replace("/(tabs)/home");
    } catch (e) {
      toast(e.message || "Registration failed");
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

        <Text style={styles.title}>Create your account.</Text>
        <Text style={styles.subtitle}>
          Already have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.replace("/login")}
          >
            Sign in
          </Text>
        </Text>

        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g. John"
          placeholderTextColor="#AAA58F"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g. Doe"
          placeholderTextColor="#AAA58F"
          value={lastName}
          onChangeText={setLastName}
        />

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
            placeholder="Enter password"
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

        <Text style={styles.label}>Confirm Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          placeholderTextColor="#AAA58F"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
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
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.darkGreen,
  },
  subtitle: {
    color: COLORS.textMuted,
    marginBottom: 20,
    marginTop: 4,
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
    marginBottom: 4,
    color: "#333",
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eye: { padding: 10, marginLeft: -48 },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 22, fontWeight: "800" },
});
