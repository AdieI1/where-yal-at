import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import DetailsHandler from "../../components/DetailsHandler";
import SessionsHandler from "../../components/SessionsHander";
import {
  buildCreatePayload,
  eventsApi,
} from "../../lib/api";

const CreateEvent = () => {
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("Whole Day");
  const [eventCapacity, setEventCapacity] = useState("");
  const [unlimitedCapacity, setUnlimitedCapacity] =
    useState(false);
  const [showEventTypes, setShowEventTypes] =
    useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [allowLateCheckIn, setAllowLateCheckIn] =
    useState(false);
  const [autoAbsent, setAutoAbsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [sessions, setSessions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const sessionsValid = () => {
    if (!sessions.length) return false;
    return sessions.every((s) => s.time_in && s.time_out);
  };

  const handleCreateEvent = async () => {
    const newErrors = {};

    if (!eventName.trim()) {
      newErrors.eventName = true;
    }
    if (!eventLocation.trim()) {
      newErrors.eventLocation = true;
    }
    if (!selectedDate) {
      newErrors.selectedDate = true;
    }
    if (!unlimitedCapacity && !eventCapacity.trim()) {
      newErrors.eventCapacity = true;
    }
    if (!eventType) {
      newErrors.eventType = true;
    }
    if (!sessionsValid()) {
      newErrors.sessions = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("Please fill up the required fields");
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildCreatePayload({
        eventName,
        eventLocation,
        eventType,
        selectedDate,
        eventCapacity,
        unlimitedCapacity,
        allowLateCheckIn,
        autoAbsent,
        sessions,
      });

      const result = await eventsApi.create(payload);

      showToast(result.message || "Event created successfully");
      router.replace({
        pathname: "/eventDetails",
        params: {
          id: String(result.event.id),
          initialEvent: encodeURIComponent(
            JSON.stringify(result.event)
          ),
        },
      });
    } catch (e) {
      showToast(e.message || "Could not create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
              Create Event
            </Text>
            <Text style={styles.headerSubtitle}>
              Please fill up the required fields.
            </Text>
          </View>
        </View>

        <DetailsHandler
          eventName={eventName}
          setEventName={setEventName}
          eventLocation={eventLocation}
          setEventLocation={setEventLocation}
          eventType={eventType}
          setEventType={setEventType}
          showEventTypes={showEventTypes}
          setShowEventTypes={setShowEventTypes}
          eventCapacity={eventCapacity}
          setEventCapacity={setEventCapacity}
          unlimitedCapacity={unlimitedCapacity}
          setUnlimitedCapacity={setUnlimitedCapacity}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          errors={errors}
        />

        <SessionsHandler
          eventType={eventType}
          errors={errors}
          onSessionsChange={setSessions}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Additional options
          </Text>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              setAllowLateCheckIn(!allowLateCheckIn)
            }
          >
            <View
              style={[
                styles.checkbox,
                allowLateCheckIn && styles.checkboxActive,
              ]}
            >
              {allowLateCheckIn && (
                <Ionicons
                  name="checkmark"
                  size={12}
                  color="#FFFFFF"
                />
              )}
            </View>
            <Text style={styles.optionText}>
              Allow late check-in
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setAutoAbsent(!autoAbsent)}
          >
            <View
              style={[
                styles.checkbox,
                autoAbsent && styles.checkboxActive,
              ]}
            >
              {autoAbsent && (
                <Ionicons
                  name="checkmark"
                  size={12}
                  color="#FFFFFF"
                />
              )}
            </View>
            <Text style={styles.optionText}>
              Auto mark absent if no show
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            submitting && styles.confirmButtonDisabled,
          ]}
          onPress={handleCreateEvent}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirm
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9E5D8",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
    fontSize: 34,
    fontWeight: "800",
    color: "#6D9A63",
  },
  headerSubtitle: {
    color: "#7D8B75",
    marginTop: -2,
  },
  section: {
    marginTop: 24,
    backgroundColor: "#F5F1E6",
    borderRadius: 18,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#5D8A54",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#A7BF9A",
    paddingBottom: 6,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#7FA06F",
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: "#7FA06F",
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    color: "#7D8B75",
  },
  confirmButton: {
    backgroundColor: "#7FC36A",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
});
