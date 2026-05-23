import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { COLORS } from "../../constants/theme";
import {
  eventsApi,
  formatEventTime,
  formatStatusLabel,
} from "../../lib/api";

function formatLongDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InfoBox({ variant, children }) {
  const isError = variant === "error";
  return (
    <View
      style={[
        styles.infoBox,
        isError ? styles.infoBoxError : styles.infoBoxInfo,
      ]}
    >
      <Ionicons
        name="information-circle"
        size={22}
        color={isError ? COLORS.danger : COLORS.darkGreen}
        style={styles.infoIcon}
      />
      <Text
        style={[
          styles.infoText,
          isError ? styles.infoTextError : styles.infoTextInfo,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

function EventDetailCard({ event, participantCount }) {
  const date = new Date(`${event.event_date}T12:00:00`);
  const month = date
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const day = date.getDate();
  const capacityLabel = event.unlimited_capacity
    ? "Unlimited"
    : String(event.capacity ?? participantCount ?? "—");

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventCardHeader}>
        <View style={styles.dateBox}>
          <Text style={styles.monthText}>{month}</Text>
          <Text style={styles.dayText}>{day}</Text>
        </View>
        <View style={styles.eventTitleWrap}>
          <Text style={styles.eventTitle}>{event.event_name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {formatStatusLabel(event.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <Text style={styles.cardSectionTitle}>Event information</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Event type:</Text>
        <Text style={styles.infoValue}>
          {event.event_type || "Whole day"}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Date:</Text>
        <Text style={styles.infoValue}>
          {formatLongDate(event.event_date)}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Time:</Text>
        <Text style={styles.infoValue}>{formatEventTime(event)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Allow late check-in:</Text>
        <Text style={styles.infoValue}>
          {event.allow_late_checkin ? "Allowed" : "Not Allowed"}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Participants:</Text>
        <Text style={styles.infoValue}>{capacityLabel}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Location:</Text>
        <Text style={[styles.infoValue, styles.locationValue]}>
          {event.event_location || "No location provided"}
        </Text>
      </View>
    </View>
  );
}

export default function JoinEvent() {
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState("search");
  const [codeError, setCodeError] = useState(false);
  const [finding, setFinding] = useState(false);
  const [joining, setJoining] = useState(false);
  const [event, setEvent] = useState(null);
  const [participantCount, setParticipantCount] = useState(null);
  const [joinBlockReason, setJoinBlockReason] = useState(null);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (!successToast) return undefined;
    const timer = setTimeout(() => setSuccessToast(false), 2800);
    return () => clearTimeout(timer);
  }, [successToast]);

  const resetToSearch = () => {
    setPhase("search");
    setCodeError(false);
    setEvent(null);
    setParticipantCount(null);
    setJoinBlockReason(null);
    setSuccessToast(false);
  };

  const handleCodeChange = (text) => {
    setCode(text.toUpperCase());
    if (codeError) {
      setCodeError(false);
    }
    if (phase !== "search") {
      setPhase("search");
      setEvent(null);
      setJoinBlockReason(null);
    }
  };

  const handleFindEvent = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setCodeError(true);
      return;
    }

    setFinding(true);
    setCodeError(false);
    try {
      const result = await eventsApi.lookupByCode(trimmed);
      setEvent(result.event);
      setParticipantCount(result.participant_count);
      setJoinBlockReason(result.join_block_reason);

      if (result.already_joined) {
        setPhase("alreadyJoined");
      } else {
        setPhase("found");
      }
    } catch {
      setCodeError(true);
      setPhase("search");
      setEvent(null);
    } finally {
      setFinding(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!event?.event_code) return;

    setJoining(true);
    try {
      const result = await eventsApi.join(event.event_code);
      setEvent(result.event);
      setPhase("alreadyJoined");
      setSuccessToast(true);
    } catch (e) {
      if (
        e.message?.toLowerCase().includes("already joined")
      ) {
        setPhase("alreadyJoined");
      } else {
        setJoinBlockReason(
          e.message || "Could not join this event."
        );
      }
    } finally {
      setJoining(false);
    }
  };

  const showFound = phase === "found" || phase === "alreadyJoined";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.darkGreen}
          />
        </TouchableOpacity>

        {!showFound ? (
          <>
            <View style={styles.heroIcon}>
              <Ionicons
                name="ticket-outline"
                size={48}
                color={COLORS.white}
              />
            </View>

            <Text style={styles.title}>Join an Event</Text>
            <Text style={styles.subtitle}>
              Enter the event code provided by the Organizer.
            </Text>

            <Text style={styles.label}>Enter Code:</Text>
            <TextInput
              style={[
                styles.input,
                codeError && styles.inputError,
              ]}
              placeholder="Enter Event Code"
              placeholderTextColor="#AAA58F"
              value={code}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              maxLength={8}
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                codeError
                  ? styles.primaryButtonError
                  : styles.primaryButtonDefault,
              ]}
              onPress={handleFindEvent}
              disabled={finding}
            >
              {finding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="search"
                    size={22}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.primaryButtonText}>
                    Find Event
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {codeError ? (
              <InfoBox variant="error">
                Can't find any events using this code. Please check
                the code again or try a new one.
              </InfoBox>
            ) : (
              <InfoBox variant="info">
                Make sure the code is correct. Codes are
                case-sensitive.
              </InfoBox>
            )}
          </>
        ) : (
          <>
            <Text style={styles.title}>Event Found!</Text>
            <Text style={styles.subtitle}>
              Check out the event details below before joining!
            </Text>

            {event && (
              <EventDetailCard
                event={event}
                participantCount={participantCount}
              />
            )}

            {phase === "alreadyJoined" ? (
              <>
                <InfoBox variant="info">
                  You have already joined this event.
                </InfoBox>
                <TouchableOpacity
                  onPress={() =>
                    router.replace("/(tabs)/home")
                  }
                >
                  <Text style={styles.returnLink}>
                    Return to Home
                  </Text>
                </TouchableOpacity>
              </>
            ) : joinBlockReason ? (
              <InfoBox variant="error">{joinBlockReason}</InfoBox>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.primaryButtonDefault,
                ]}
                onPress={handleJoinEvent}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.primaryButtonText}>
                      Join Event
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.tryAnother}
              onPress={resetToSearch}
            >
              <Text style={styles.tryAnotherText}>
                Try another code
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {successToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            Joined event Successfully!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.darkGreen,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    marginBottom: 24,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  label: {
    fontWeight: "700",
    color: COLORS.darkGreen,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8D4C4",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.darkGreen,
    marginBottom: 20,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  primaryButton: {
    flexDirection: "row",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  primaryButtonDefault: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonError: {
    backgroundColor: COLORS.danger,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoBox: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    alignItems: "flex-start",
  },
  infoBoxInfo: {
    borderColor: COLORS.primary,
    backgroundColor: "#EEF8E8",
  },
  infoBoxError: {
    borderColor: COLORS.danger,
    backgroundColor: "#FCEAE8",
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  infoTextInfo: {
    color: COLORS.darkGreen,
  },
  infoTextError: {
    color: COLORS.danger,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: 18,
    marginBottom: 20,
  },
  eventCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateBox: {
    width: 68,
    height: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B8C5A9",
    overflow: "hidden",
    marginRight: 12,
  },
  monthText: {
    backgroundColor: "#9FB38A",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 4,
    fontWeight: "700",
    fontSize: 11,
  },
  dayText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.darkGreen,
  },
  eventTitleWrap: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.darkGreen,
  },
  statusBadge: {
    backgroundColor: "#DCE8CF",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 6,
  },
  statusBadgeText: {
    color: COLORS.darkGreen,
    fontWeight: "700",
    fontSize: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#C7D2BF",
    marginVertical: 16,
  },
  cardSectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.darkGreen,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "700",
    color: COLORS.darkGreen,
    width: 130,
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  locationValue: {
    lineHeight: 20,
  },
  returnLink: {
    textAlign: "center",
    color: COLORS.darkGreen,
    fontWeight: "700",
    fontSize: 16,
    marginTop: 16,
  },
  tryAnother: {
    marginTop: 8,
    alignItems: "center",
  },
  tryAnotherText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
  toast: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    color: COLORS.darkGreen,
    fontWeight: "700",
    fontSize: 15,
  },
});
