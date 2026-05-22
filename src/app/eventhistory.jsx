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
  formatStatusLabel,
} from "../../lib/api";

const EventHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsApi.history();
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
      loadHistory();
    }, [loadHistory])
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
            color="#7FA06F"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Event history
          </Text>
          <Text style={styles.headerSubtitle}>
            Events you created, including cancelled.
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#7FA06F"
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : events.length === 0 ? (
        <Text style={styles.emptyText}>
          No events yet.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {events.map((item) => {
            const { month, day } = formatDateParts(
              item.event_date
            );

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
    backgroundColor: "#E9E5D8",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F8F5EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#5D8A54",
  },
  headerSubtitle: {
    color: "#7D8B75",
    marginTop: 2,
    fontSize: 13,
  },
  list: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#7D8B75",
    marginTop: 40,
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
    color: "#C0392B",
    marginTop: 40,
    paddingHorizontal: 20,
  },
});
