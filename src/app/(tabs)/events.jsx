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
import { useFocusEffect } from "expo-router";

import EventCard from "../../../components/eventCard";
import {
  eventsApi,
  formatDateParts,
  formatEventTime,
  formatStatusLabel,
} from "../../../lib/api";
import { COLORS } from "../../../constants/theme";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "created", label: "Created" },
  { key: "joined", label: "Joined" },
];

export default function EventsScreen() {
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async (activeFilter) => {
    setLoading(true);
    try {
      const data = await eventsApi.feed(activeFilter);
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeed(filter);
    }, [filter, loadFeed])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>
          Upcoming and ongoing events you created or joined.
        </Text>
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
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : events.length === 0 ? (
        <Text style={styles.empty}>
          No events in this category yet.
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
                status={formatStatusLabel(item.status)}
                event={{
                  id: String(item.id),
                  title: item.event_name,
                  location: item.event_location,
                  type: item.event_type,
                  status: formatStatusLabel(item.status),
                  selectedDate: item.event_date,
                  time: formatEventTime(item),
                  allowLateCheckIn: String(item.allow_late_checkin),
                }}
              />
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.darkGreen,
  },
  subtitle: {
    color: COLORS.textMuted,
    marginTop: 4,
    fontSize: 13,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 14,
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
    fontSize: 12,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  list: {
    paddingBottom: 100,
  },
  empty: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 40,
    fontSize: 15,
  },
});
