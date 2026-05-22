import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ParticipantsList from "../../components/participantsList";
import {
  eventsApi,
  formatEventTime,
  formatStatusLabel,
  routeParam,
} from "../../lib/api";

function parseInitialEvent(params) {
  const raw = routeParam(params.initialEvent);
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

const EventDetails = () => {
  const params = useLocalSearchParams();
  const eventId = routeParam(params.id);
  const initialEvent = parseInitialEvent(params);

  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(
    Boolean(eventId && !initialEvent)
  );
  const [cancelling, setCancelling] = useState(false);

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (!eventId) {
      setEvent({
        event_name: routeParam(params.title) || "Untitled Event",
        event_location: routeParam(params.location) || "",
        event_type: routeParam(params.type) || "Whole Day",
        event_date: routeParam(params.selectedDate),
        status: routeParam(params.status) || "upcoming",
        allow_late_checkin:
          routeParam(params.allowLateCheckIn) === "true",
        sessions: [],
      });
      setLoading(false);
      return;
    }

    if (initialEvent) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await eventsApi.get(eventId);
        if (!cancelled) {
          setEvent(data.event);
        }
      } catch (e) {
        if (!cancelled) {
          showToast(e.message || "Could not load event");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleCancel = () => {
    if (!eventId || event?.status === "cancelled") return;

    Alert.alert(
      "Cancel event",
      "Are you sure you want to cancel this event?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await eventsApi.cancel(eventId);
              showToast("Event cancelled");
              router.replace("/(tabs)/home");
            } catch (e) {
              showToast(
                e.message || "Could not cancel event"
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#7FA06F"
          style={{ marginTop: 80 }}
        />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          Event not found.
        </Text>
      </SafeAreaView>
    );
  }

  const date = event.event_date
    ? new Date(`${event.event_date}T12:00:00`)
    : new Date();

  const month = date.toLocaleString("default", {
    month: "short",
  });
  const day = date.getDate();
  const isCancelled = event.status === "cancelled";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color="#7B9B6A"
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              Event Details
            </Text>
            <Text style={styles.headerSubtitle}>
              View all event details and attendance
              information.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.dateBox}>
              <Text style={styles.monthText}>{month}</Text>
              <Text style={styles.dayText}>{day}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>
                {event.event_name}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {formatStatusLabel(event.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            Event information
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Event type:</Text>
            <Text style={styles.value}>
              {event.event_type || "Whole day"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {date.toDateString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {formatEventTime(event)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Allow late check-in:
            </Text>
            <Text style={styles.value}>
              {event.allow_late_checkin
                ? "Allowed"
                : "Not Allowed"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>
              {event.event_location ||
                "No location provided"}
            </Text>
          </View>

          {!isCancelled && (
            <>
              <View style={styles.divider} />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    router.push({
                      pathname: "/editevent",
                      params: {
                        id: String(event.id),
                        title: event.event_name,
                        location: event.event_location,
                        type: event.event_type,
                        selectedDate: event.event_date,
                        allowLateCheckIn: String(
                          event.allow_late_checkin
                        ),
                      },
                    })
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.buttonText}>
                    Edit details
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Cancel Event
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <ParticipantsList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAE5D8",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F4F0E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#5E7C59",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#7B8476",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#F4F0E6",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateBox: {
    width: 72,
    height: 82,
    borderRadius: 14,
    backgroundColor: "#F7F7F2",
    borderWidth: 1,
    borderColor: "#B8C5A9",
    overflow: "hidden",
    marginRight: 14,
  },
  monthText: {
    backgroundColor: "#9FB38A",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 4,
    fontWeight: "700",
    fontSize: 12,
  },
  dayText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 34,
    fontWeight: "800",
    color: "#4D644B",
  },
  eventTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#445C43",
  },
  badge: {
    backgroundColor: "#DCE8CF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  badgeText: {
    color: "#6E8B63",
    fontWeight: "700",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#C7D2BF",
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#5E7C59",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    paddingRight: 10,
  },
  label: {
    fontWeight: "700",
    color: "#4E654C",
    width: 140,
    fontSize: 16,
  },
  value: {
    flex: 1,
    color: "#7A7A7A",
    fontSize: 16,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8CC576",
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D96B5F",
    paddingVertical: 14,
    borderRadius: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 6,
  },
  errorText: {
    textAlign: "center",
    marginTop: 40,
    color: "#7B8476",
  },
});
