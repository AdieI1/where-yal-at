import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

const ParticipantsList = ({
  eventId,
  eventName,
  participants = [],
  total = 0,
  isCreator = false,
}) => {
  const displayTotal = total || participants.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Participants</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>Total: {displayTotal}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {participants.length === 0 ? (
        <Text style={styles.empty}>No participants yet.</Text>
      ) : (
        participants.map((participant) => (
          <View key={participant.participant_id || participant.user_id} style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(participant.name || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>{participant.name}</Text>
          </View>
        ))
      )}

      {isCreator && eventId ? (
        <>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/eventParticipants",
                params: {
                  id: String(eventId),
                  title: eventName || "",
                },
              })
            }
          >
            <Text style={styles.viewAll}>View all Participants</Text>
          </TouchableOpacity>
        </>
      ) : null}
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
    backgroundColor: "#9FB38A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  name: {
    fontSize: 17,
    color: "#727272",
    fontWeight: "500",
  },
  empty: {
    color: "#7B8476",
    fontSize: 14,
    marginBottom: 8,
  },
  viewAll: {
    textAlign: "center",
    color: "#5E7C59",
    fontWeight: "700",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
