import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import DetailsHandler from "../../components/DetailsHandler";
import SessionsHandler from "../../components/SessionsHander";

const EditEvent = () => {

  // ✅ GET CURRENT EVENT DATA
  const params = useLocalSearchParams();

  // ✅ STATES
  const [eventName, setEventName] =
    useState(params.title || "");

  const [eventLocation, setEventLocation] =
    useState(params.location || "");

  const [eventType, setEventType] =
    useState(params.type || "Whole Day");

  const [eventCapacity, setEventCapacity] =
    useState("");

  const [unlimitedCapacity, setUnlimitedCapacity] =
    useState(true);

  const [showEventTypes, setShowEventTypes] =
    useState(false);

  const [allowLateCheckIn, setAllowLateCheckIn] =
    useState(
      params.allowLateCheckIn === "true"
    );

  const [autoAbsent, setAutoAbsent] =
    useState(true);

  const [errors, setErrors] =
    useState({});

  // ✅ SAFE DATE
  const [selectedDate, setSelectedDate] =
    useState(
      params.selectedDate
        ? new Date(params.selectedDate)
        : new Date()
    );

  // ✅ SESSIONS
  const [sessions, setSessions] =
    useState([
      {
        id: 1,
        label: "Morning",
        timeIn: "8:00 AM",
        timeOut: "12:00 PM",
      },

      {
        id: 2,
        label: "Afternoon",
        timeIn: "1:30 PM",
        timeOut: "5:30 PM",
      },
    ]);

  // ✅ SAVE EVENT
  const handleSave = () => {

    let newErrors = {};

    // VALIDATION
    if (!eventName.trim()) {
      newErrors.eventName = true;
    }

    if (!eventLocation.trim()) {
      newErrors.eventLocation = true;
    }

    const invalidSessions =
      sessions.some(
        (session) =>
          !session.timeIn ||
          !session.timeOut
      );

    if (invalidSessions) {
      newErrors.sessions = true;
    }

    setErrors(newErrors);

    // STOP IF INVALID
    if (
      Object.keys(newErrors).length > 0
    ) {
      ToastAndroid.show(
        "Please fill up the required fields",
        ToastAndroid.SHORT
      );

      return;
    }

    // SUCCESS
    ToastAndroid.show(
      "Event updated successfully",
      ToastAndroid.SHORT
    );

    // NAVIGATE BACK WITH UPDATED DATA
    setTimeout(() => {

      router.replace({
        pathname: "/eventDetails",

        params: {
          title: eventName,

          location:
            eventLocation,

          type: eventType,

          status: "Active",

          time: "Whole day",

          selectedDate:
            selectedDate.toISOString(),

          allowLateCheckIn:
            allowLateCheckIn.toString(),
        },
      });

    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* HEADER */}
        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
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

            <Text
              style={styles.headerSubtitle}
            >
              Update your event
              information.
            </Text>
          </View>

        </View>

        {/* DETAILS */}
        <DetailsHandler
          eventName={eventName}
          setEventName={
            setEventName
          }

          eventLocation={
            eventLocation
          }

          setEventLocation={
            setEventLocation
          }

          eventType={eventType}

          setEventType={
            setEventType
          }

          showEventTypes={
            showEventTypes
          }

          setShowEventTypes={
            setShowEventTypes
          }

          eventCapacity={
            eventCapacity
          }

          setEventCapacity={
            setEventCapacity
          }

          unlimitedCapacity={
            unlimitedCapacity
          }

          setUnlimitedCapacity={
            setUnlimitedCapacity
          }

          selectedDate={
            selectedDate
          }

          setSelectedDate={
            setSelectedDate
          }

          errors={errors}
        />

        {/* SESSIONS */}
        <SessionsHandler
          eventType={eventType}

          sessions={sessions}

          setSessions={
            setSessions
          }

          errors={errors}
        />

        {/* ADDITIONAL OPTIONS */}
        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Additional options
          </Text>

          {/* LATE CHECK IN */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              setAllowLateCheckIn(
                !allowLateCheckIn
              )
            }
          >

            <View
              style={[
                styles.checkbox,

                allowLateCheckIn &&
                  styles.checkboxActive,
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

          {/* AUTO ABSENT */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              setAutoAbsent(
                !autoAbsent
              )
            }
          >

            <View
              style={[
                styles.checkbox,

                autoAbsent &&
                  styles.checkboxActive,
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
              Auto mark absent if no
              show
            </Text>

          </TouchableOpacity>

        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >

          <Text
            style={styles.saveButtonText}
          >
            Save
          </Text>

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

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

});