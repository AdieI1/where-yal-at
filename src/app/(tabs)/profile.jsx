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
import { router } from "expo-router";

import { COLORS } from "../../../constants/theme";
import { authApi } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const toast = (msg) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await authApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      await updateUser(data.user);
      toast("Profile updated");
    } catch (e) {
      toast(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Sign out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await authApi.logout();
          } catch {
            /* still sign out locally */
          }
          await signOut();
          router.replace("/");
        },
      },
    ]);
    setLoggingOut(false);
  };

  const displayName =
    user?.name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "User";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7FA06F&color=fff`,
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>{displayName}</Text>

        <Text style={styles.label}>Email Address:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, loggingOut && styles.disabled]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.darkGreen,
    marginBottom: 20,
  },
  avatarWrap: {
    alignSelf: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.darkGreen,
    marginBottom: 24,
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
    color: "#333",
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  logoutBtn: {
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
    backgroundColor: COLORS.card,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: "800",
    fontSize: 16,
  },
  disabled: { opacity: 0.7 },
});
