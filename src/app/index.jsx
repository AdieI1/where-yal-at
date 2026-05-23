import React from "react";
import {Text,View,StyleSheet,Image,ImageBackground,Dimensions,TouchableOpacity,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const bg = require("../../assets/images/background.png");
const logo = require("../../assets/images/WYA-LOGO.png");

const content = {
  title: "That’s what we’re trying to find out.",
  description:
    'Because “I’m on the way” and “traffic was crazy” stopped working a long time ago.',
  buttonText: "Get Started",
  loginText: "Already have an account?",
  loginAction: "Login",
};

export default function Index() {
  const router = useRouter();
  
  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={bg} resizeMode="cover" style={styles.background}>
        <View style={styles.spacing}>
          {/* for logo */}
          <Image source={logo} style={styles.logo} />

          {/* texts section */}
          <View style={styles.textContainer}>
            <Text style={styles.heading}>{content.title}</Text>

            <Text style={styles.description}>
              {content.description}
            </Text>
          </View>

          {/* forda bottom section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={handleGetStarted}
            >
              <Text style={styles.buttonText}>
                {content.buttonText}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                {content.loginText}{" "}
              </Text>

              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>
                  {content.loginAction}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const COLORS = {
  primary: "#82C36B",
  darkGreen: "#5D8E57",
  background: "#F3EEDF",
  textLight: "#97B38A",
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  spacing: {
    flex: 1,
    paddingHorizontal: width * 0.08,
    justifyContent: "space-between",
    paddingBottom: height * 0.010,
  },

  logo: {
    width: width * 0.95,
    height: height * 0.24,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: height * 0.20,
  },

  textContainer: {
    marginTop: -height * 0.02,
    alignItems: "center",
  },

  heading: {
    fontSize: width * 0.065,
    lineHeight: width * 0.082,
    fontWeight: "800",
    color: COLORS.darkGreen,
    marginBottom: height * 0.015,
    width: "85%",
  },

  description: {
    fontSize: width * 0.040,
    lineHeight: width * 0.06,
    color: COLORS.textLight,
    width: "85%",
  },

  bottomSection: {
    marginBottom: height * 0.08,
  },

  button: {
    backgroundColor: COLORS.primary,
    width: "100%",
    paddingVertical: height * 0.010,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.025,
  },

  buttonText: {
    color: "white",
    fontSize: width * 0.05,
    fontWeight: "800",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    color: COLORS.darkGreen,
    fontSize: width * 0.04,
  },

  loginLink: {
    color: COLORS.darkGreen,
    fontSize: width * 0.04,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});