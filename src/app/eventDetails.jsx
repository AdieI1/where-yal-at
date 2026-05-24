import React, { useCallback, useEffect, useState } from "react";
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
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ParticipantsList from "../../components/participantsList";
import {
  eventsApi,
  formatEventTime,
  formatStatusLabel,
  formatTime12,
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
  const [myAttendance, setMyAttendance] = useState(null);
  const [participantPreview, setParticipantPreview] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(Boolean(eventId && !initialEvent));
  const [cancelling, setCancelling] = useState(false);
  const [joining, setJoining] = useState(false);
  const [actionSessionId, setActionSessionId] = useState(null);

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const loadEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      const data = await eventsApi.get(eventId);
      setEvent(data.event);
      setMyAttendance(data.my_attendance || null);
      setParticipantPreview(data.participant_preview || []);
      setParticipantCount(
        data.participant_count ?? data.event?.participant_count ?? 0
      );
    } catch (e) {
      showToast(e.message || "Could not load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      if (eventId) {
        loadEvent();
      }
    }, [eventId, loadEvent])
  );

  useEffect(() => {
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
    }
  }, [eventId]);

  const phase = event?.phase || event?.status;
  const showSessions =
    event?.is_joined &&
    event?.status !== "cancelled" &&
    (myAttendance?.sessions?.length ?? 0) > 0;

  useEffect(() => {
    if (showSessions && phase === "ongoing") {
      setActiveTab("sessions");
    } else if (!showSessions) {
      setActiveTab("info");
    }
  }, [showSessions, phase]);

  const handleJoin = async () => {
    if (!event?.event_code) return;
    setJoining(true);
    try {
      const result = await eventsApi.join(event.event_code);
      showToast(result.message || "Joined!");
      await loadEvent();
    } catch (e) {
      showToast(e.message || "Could not join");
    } finally {
      setJoining(false);
    }
  };

  const handleTimeAction = async (sessionId, action) => {
    setActionSessionId(sessionId);
    try {
      const result =
        action === "in"
          ? await eventsApi.timeIn(eventId, sessionId)
          : await eventsApi.timeOut(eventId, sessionId);
      showToast(result.message || "Updated");
      await loadEvent();
    } catch (e) {
      showToast(e.message || "Action failed");
    } finally {
      setActionSessionId(null);
    }
  };

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
              showToast(e.message || "Could not cancel event");
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
        <Text style={styles.errorText}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const date = event.event_date
    ? new Date(`${event.event_date}T12:00:00`)
    : new Date();
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  const isCancelled = event.status === "cancelled";
  const isCreator = event.is_creator;
  const isJoined = event.is_joined;

  const renderSessionCard = (sessionRow) => {
    const att = sessionRow.attendance || {};
    const hasTimedIn = Boolean(att.time_in);
    const canTimeIn = att.can_time_in;
    const canTimeOut = att.can_time_out;
    const busy = actionSessionId === sessionRow.session_id;

    let buttonLabel = "Time in";
    let buttonStyle = styles.timeInButtonDisabled;
    let onPress = null;
    let disabled = true;

    if (!hasTimedIn) {
      buttonLabel = "Time in";
      if (canTimeIn) {
        buttonStyle = styles.timeInButton;
        onPress = () =>
          handleTimeAction(sessionRow.session_id, "in");
        disabled = busy;
      }
    } else if (!att.time_out) {
      buttonLabel = "Time out";
      if (canTimeOut) {
        buttonStyle = styles.timeOutButton;
        onPress = () =>
          handleTimeAction(sessionRow.session_id, "out");
        disabled = busy;
      } else {
        buttonStyle = styles.timeOutButtonDisabled;
      }
    } else {
      buttonLabel = "Completed";
      buttonStyle = styles.timeOutButtonDisabled;
    }

    return (
      <View key={sessionRow.session_id} style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>
            {sessionRow.session_label}
          </Text>
          {att.is_active && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>
        <Text style={styles.sessionTime}>
          {formatTime12(sessionRow.time_in)} -{" "}
          {formatTime12(sessionRow.time_out)}
        </Text>

        {hasTimedIn && (
          <Text style={styles.timedInLabel}>
            Timed in at {att.time_in_display}
          </Text>
        )}

        {!isCancelled && (
          <TouchableOpacity
            style={[styles.sessionButton, buttonStyle]}
            onPress={onPress}
            disabled={disabled || !onPress}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sessionButtonText}>
                {buttonLabel}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={26} color="#7B9B6A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Event Details</Text>
            <Text style={styles.headerSubtitle}>
              View all event details and attendance information.
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
              <Text style={styles.eventTitle}>{event.event_name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {formatStatusLabel(phase)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {showSessions && (
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "info" && styles.tabActive,
                ]}
                onPress={() => setActiveTab("info")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "info" && styles.tabTextActive,
                  ]}
                >
                  Info
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "sessions" && styles.tabActive,
                ]}
                onPress={() => setActiveTab("sessions")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "sessions" && styles.tabTextActive,
                  ]}
                >
                  Sessions
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "sessions" && showSessions ? (
            <View>
              <Text style={styles.sectionTitle}>Sessions</Text>
              {myAttendance.sessions.map(renderSessionCard)}
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Event information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Event type:</Text>
                <Text style={styles.value}>
                  {event.event_type || "Whole day"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{date.toDateString()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>
                  {formatEventTime(event)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Allow late check-in:</Text>
                <Text style={styles.value}>
                  {event.allow_late_checkin ? "Allowed" : "Not Allowed"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>
                  {event.event_location || "No location provided"}
                </Text>
              </View>
            </>
          )}

          {isCreator && event.event_code && (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Event join code</Text>
              <Text style={styles.codeValue}>{event.event_code}</Text>
              <Text style={styles.codeHint}>
                Share this code so others can join your event.
              </Text>
            </View>
          )}

          {!isCancelled && !isCreator && !isJoined && event.event_code && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoin}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.joinButtonText}>Join Event</Text>
              )}
            </TouchableOpacity>
          )}

          {!isCancelled && isCreator && (
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
                  <Text style={styles.buttonText}>Edit details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Cancel Event</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {isCreator && (
          <ParticipantsList
            eventId={event.id}
            eventName={event.event_name}
            participants={participantPreview}
            total={participantCount}
            isCreator
          />
        )}
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
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#E8E4D8",
  },
  tabActive: {
    backgroundColor: "#8CC576",
  },
  tabText: {
    color: "#7B8476",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
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
  sessionCard: {
    backgroundColor: "#F7F7F2",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#C7D2BF",
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#445C43",
  },
  activeBadge: {
    backgroundColor: "#DCE8CF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: "#5E7C59",
    fontWeight: "700",
    fontSize: 11,
  },
  sessionTime: {
    color: "#7B8476",
    marginTop: 6,
    marginBottom: 8,
  },
  timedInLabel: {
    color: "#5E7C59",
    fontWeight: "600",
    marginBottom: 10,
  },
  sessionButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  sessionButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  timeInButton: {
    backgroundColor: "#8CC576",
  },
  timeInButtonDisabled: {
    backgroundColor: "#B8B8B8",
  },
  timeOutButton: {
    backgroundColor: "#8CC576",
  },
  timeOutButtonDisabled: {
    backgroundColor: "#B8B8B8",
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
  codeBox: {
    marginTop: 16,
    backgroundColor: "#E8F0E3",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  codeLabel: {
    fontWeight: "700",
    color: "#5E7C59",
    fontSize: 14,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 6,
    color: "#445C43",
    marginVertical: 8,
  },
  codeHint: {
    fontSize: 12,
    color: "#7B8476",
    textAlign: "center",
  },
  joinButton: {
    backgroundColor: "#8CC576",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 18,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
});
