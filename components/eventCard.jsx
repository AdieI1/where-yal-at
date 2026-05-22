import React from "react";
import {View,Text,StyleSheet,TouchableOpacity,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const EventCard = ({
  month,
  day,
  title,
  time,
  location,
  status,
  event,
}) => {
  const handlePress = () => {
    router.push({
      pathname: "/eventDetails",
      params: {
        title: event.title,
        month: event.month,
        day: event.day,
        time: event.time,
        location: event.location,
        status: event.status,
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.dateCard}>
        <View style={styles.monthContainer}>
          <Text style={styles.monthText}>
            {month}
          </Text>
        </View>

        <View style={styles.dayContainer}>
          <Text style={styles.dayText}>
            {day}
          </Text>
        </View>
      </View>

      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>
          {title}
        </Text>

        <Text style={styles.eventMeta}>
          ⏰ {time}
        </Text>

        <Text style={styles.eventMeta}>
          📍 {location}
        </Text>
      </View>

      <View style={styles.rightSide}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {status}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#7A8C72"
        />
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "#F8F5EB",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  dateCard: {
    width: 60,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },

  monthContainer: {
    backgroundColor: "#94B28A",
    paddingVertical: 4,
    alignItems: "center",
  },

  monthText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  dayContainer: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 8,
  },

  dayText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4D644B",
  },

  eventInfo: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#50654B",
    marginBottom: 4,
  },

  eventMeta: {
    fontSize: 11,
    color: "#7D8B75",
    marginBottom: 2,
  },

  rightSide: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
  },

  badge: {
    backgroundColor: "#D8E7CF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    color: "#6D8767",
    fontSize: 10,
    fontWeight: "700",
  },
});