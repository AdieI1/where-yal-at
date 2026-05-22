import React from "react";
import {StyleSheet,Text,View,Image,TouchableOpacity,} from "react-native";

const pfp = require("../assets/images/pfppfp.png");

const participants = [
  {
    id: 1,
    name: "Argyle Myers Sios-e",
    image: pfp,
  },
  {
    id: 2,
    name: "Neca Vae Galarpe",
    image: { uri: "https://surl.li/ghiwmp" },
  },
  {
    id: 3,
    name: "Alexandra Robles",
    image: { uri: "https://surl.lu/tnxvks" },
  },
  {
    id: 4,
    name: "Justin Bongcas",
    image: { uri: "https://surli.cc/reuxlr" },
  },
  {
    id: 5,
    name: "Aman Datu-Imam",
    image: { uri: "https://surl.li/bczsqy" },
  },
];

const ParticipantsList = () => {
  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Participants</Text>

        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>Total: 67</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* PARTICIPANTS */}
      {participants.map((participant) => (
        <View key={participant.id} style={styles.userRow}>
          <Image
            source={participant.image}
            style={styles.avatar}
          />

          <Text style={styles.name}>
            {participant.name}
          </Text>
        </View>
      ))}

      <View style={styles.divider} />

      {/* VIEW ALL */}
      <TouchableOpacity>
        <Text style={styles.viewAll}>
          View all Participants
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ParticipantsList;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F4F0E6",
    borderRadius: 24,
    padding: 18,
    marginTop: 6,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#5E7C59",
  },

  totalBadge: {
    backgroundColor: "#DCE8CF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },

  totalText: {
    color: "#5E7C59",
    fontWeight: "700",
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: "#C9D3C0",
    marginVertical: 16,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 14,
  },

  name: {
    fontSize: 17,
    color: "#727272",
    fontWeight: "500",
  },

  viewAll: {
    textAlign: "center",
    color: "#5E7C59",
    fontWeight: "700",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});