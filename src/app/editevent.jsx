import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import DetailsHandler from "../../components/DetailsHandler";
import SessionsHandler from "../../components/SessionsHander";
import {
  buildCreatePayload,
  eventsApi,
} from "../../lib/api";

const EditEvent = () => {
  const params = useLocalSearchParams();
  const eventId = params.id;

  const [eventName, setEventName] = useState(
    params.title || ""
  );
  const [eventLocation, setEventLocation] = useState(
    params.location || ""
  );
  const [eventType, setEventType] = useState(
    params.type === "Whole day" ? "Whole Day" : params.type || "Whole Day"
  );
  const [eventCapacity, setEventCapacity] = useState("");
  const [unlimitedCapacity, setUnlimitedCapacity] =
    useState(true);
  const [showEventTypes, setShowEventTypes] = useState(false);
  const [allowLateCheckIn, setAllowLateCheckIn] = useState(
    params.allowLateCheckIn === "true"
  );
  const [autoAbsent, setAutoAbsent] = useState(true);
  const [errors, setErrors] = useState({});
  const [sessions, setSessions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    params.selectedDate
      ? new Date(`${params.selectedDate}T12:00:00`)
      : new Date()
  );

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const sessionsValid = () => {
    if (!sessions.length) return true;
    return sessions.every((s) => s.time_in && s.time_out);
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!eventName.trim()) {
      newErrors.eventName = true;
    }
    if (!eventLocation.trim()) {
      newErrors.eventLocation = true;
    }
    if (!sessionsValid()) {
      newErrors.sessions = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("Please fill up the required fields");
      return;
    }

    if (!eventId) {
      showToast("Missing event id");
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

      if (
        !sessions.length ||
        !sessions.every((s) => s.time_in && s.time_out)
      ) {
        delete payload.sessions;
      }

      await eventsApi.update(eventId, payload);

      showToast("Event updated successfully");

      router.replace({
        pathname: "/eventDetails",
        params: { id: String(eventId) },
      });
    } catch (e) {
      showToast(e.message || "Could not update event");
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
              Edit Event Details
            </Text>
            <Text style={styles.headerSubtitle}>
              Update your event information.
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
                  color="#fff"
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
                  color="#fff"
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
            styles.saveButton,
            submitting && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditEvent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9E5D8",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: "800",
    color: "#5D8A54",
  },
  headerSubtitle: {
    color: "#7D8B75",
    marginTop: 2,
  },
  section: {
    marginTop: 12,
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
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: "#7FA06F",
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    color: "#7D8B75",
  },
  saveButton: {
    backgroundColor: "#7FC36A",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
});
