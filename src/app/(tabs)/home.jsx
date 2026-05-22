import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { router } from "expo-router";

import EventCard from "../../../components/eventCard";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{
                uri: "https://i.pravatar.cc/150?img=12",
              }}
              style={styles.avatar}
            />

            <View>
              <Text style={styles.greeting}>
                Hi, John!
              </Text>

              <Text style={styles.subText}>
                It’s good to see you!{"\n"}
                Ready for today’s events?
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationBtn}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#FFF8E7"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Event Calendar!
          </Text>

          <View style={styles.calendarContainer}>
            <Calendar
              theme={{
                backgroundColor: "#A8C39A",
                calendarBackground: "#A8C39A",
                textSectionTitleColor: "#4D644B",
                selectedDayBackgroundColor:
                  "#4B6B4B",
                selectedDayTextColor: "#FFFFFF",
                todayTextColor: "#4B6B4B",
                dayTextColor: "#4D644B",
                monthTextColor: "#FFFFFF",
                arrowColor: "#FFFFFF",
                textDisabledColor: "#90A18C",
              }}
              markedDates={{
                "2025-09-13": {
                  selected: true,
                  selectedColor: "#4B6B4B",
                },
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle-outline"
              label="Create Event"
              onPress={() =>
                router.push("/eventcreate")
              }
            />

            <QuickAction
              icon="calendar-outline"
              label="Participate Event"
            />

            <QuickAction
              icon="refresh-outline"
              label="Event Attendance History"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>
              Your events
            </Text>

            <Text style={styles.viewAll}>
              View all
            </Text>
          </View>

          <EventCard
            month="SEP"
            day="13"
            title="STI Intramurals"
            time="8:00 AM - 5:00 PM"
            location="STI Kauswagan Campus"
            status="Upcoming"
            event={{
              title: "STI Intramurals",
              month: "SEP",
              day: "13",
              time: "8:00 AM - 5:00 PM",
              location:
                "STI Kauswagan Campus",
              status: "Upcoming",
            }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>
              Events you participated
            </Text>

            <Text style={styles.viewAll}>
              View all
            </Text>
          </View>

          <EventCard
            month="MAY"
            day="31"
            title="Sean’s Birthday"
            time="1:00 PM - 3:00 PM"
            location="SM Downtown"
            status="Upcoming"
            event={{
              title: "Sean’s Birthday",
              month: "MAY",
              day: "31",
              time: "1:00 PM - 3:00 PM",
              location: "SM Downtown",
              status: "Upcoming",
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const QuickAction = ({
  icon,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={32}
        color="#94B28A"
      />

      <Text style={styles.actionText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9E5D8",
  },

  header: {
    backgroundColor: "#7FA06F",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },

  greeting: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  subText: {
    color: "#E6F0DF",
    fontSize: 12,
    marginTop: 2,
  },

  notificationBtn: {
    borderWidth: 1,
    borderColor: "#DCE7D7",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5D7556",
    marginBottom: 12,
  },

  calendarContainer: {
    backgroundColor: "#A8C39A",
    borderRadius: 18,
    overflow: "hidden",
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  actionCard: {
    backgroundColor: "#F8F5EB",
    width: "31%",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 3,
  },

  actionText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    color: "#6D7F68",
    fontWeight: "600",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewAll: {
    color: "#A2A393",
    fontSize: 12,
  },
});