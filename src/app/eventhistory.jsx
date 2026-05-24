import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import EventCard from "../../components/eventCard";
import {
  eventsApi,
  formatDateParts,
  formatEventTime,
} from "../../lib/api";
import { COLORS } from "../../constants/theme";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "created", label: "Created" },
  { key: "joined", label: "Joined" },
];

const EventHistory = () => {
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async (activeFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsApi.history(activeFilter);
      setEvents(data.events || []);
    } catch (e) {
      setError(e.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory(filter);
    }, [filter, loadHistory])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.darkGreen}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerSubtitle}>
            View all the events you attended and missed!
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              filter === tab.key && styles.tabActive,
            ]}
            onPress={() => setFilter(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                filter === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : events.length === 0 ? (
        <Text style={styles.emptyText}>
          No finished events yet.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {events.map((item) => {
            const { month, day } = formatDateParts(item.event_date);

            return (
              <EventCard
                key={item.id}
                month={month}
                day={day}
                title={item.event_name}
                time={formatEventTime(item)}
                location={item.event_location}
                status={item.status}
                attendanceStatus={
                  item.is_creator
                    ? item.status
                    : item.my_attendance_status || item.status
                }
                event={{
                  id: String(item.id),
                  title: item.event_name,
                  location: item.event_location,
                  type: item.event_type,
                  status: item.status,
                  selectedDate: item.event_date,
                  time: formatEventTime(item),
                  allowLateCheckIn: String(
                    item.allow_late_checkin
                  ),
                }}
              />
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default EventHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.darkGreen,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  list: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 40,
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
    color: COLORS.danger,
    marginTop: 40,
    paddingHorizontal: 20,
  },
});
