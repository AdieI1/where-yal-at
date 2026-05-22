import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const DetailsHandler = ({
  eventName,
  setEventName,
  eventLocation,
  setEventLocation,
  eventType,
  setEventType,
  showEventTypes,
  setShowEventTypes,
  eventCapacity,
  setEventCapacity,
  unlimitedCapacity,
  setUnlimitedCapacity,
  selectedDate,
  setSelectedDate,
  errors,
}) => {
  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const today = new Date();

  const eventTypes = [
    "Morning",
    "Half Day",
    "Afternoon",
    "Whole Day",
  ];

  const onDateChange = (event, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Event Details
      </Text>

      <Text style={styles.label}>Event Name:</Text>

      <TextInput
        placeholder="Enter event name."
        placeholderTextColor="#AAA58F"
        value={eventName}
        onChangeText={setEventName}
        style={[
          styles.input,
          errors.eventName && styles.errorInput,
        ]}
      />

      <Text style={styles.label}>Date:</Text>

      <TouchableOpacity
        style={[
          styles.inputRow,
          errors.selectedDate && styles.errorInput,
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color="#8FA184"
        />

        <Text style={styles.inputRowText}>
          {selectedDate
            ? selectedDate.toDateString()
            : "Tap to open calendar."}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || today}
          mode="date"
          display="default"
          minimumDate={today}
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>
        Event Location:
      </Text>

      <TextInput
        placeholder="Enter location"
        placeholderTextColor="#AAA58F"
        value={eventLocation}
        onChangeText={setEventLocation}
        style={[
          styles.input,
          errors.eventLocation &&
            styles.errorInput,
        ]}
      />

      <View style={styles.row}>
        <View style={styles.halfContainer}>
          <Text style={styles.label}>
            Event Type:
          </Text>

          <TouchableOpacity
            style={[
              styles.dropdown,
              errors.eventType &&
                styles.errorInput,
            ]}
            onPress={() =>
              setShowEventTypes(!showEventTypes)
            }
          >
            <Text style={styles.dropdownText}>
              {eventType}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#7D8B75"
            />
          </TouchableOpacity>

          {showEventTypes && (
            <View style={styles.dropdownMenu}>
              {eventTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setEventType(type);
                    setShowEventTypes(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.halfContainer}>
          <Text style={styles.label}>
            Event Capacity
          </Text>

          <TextInput
            placeholder="Insert Capacity"
            placeholderTextColor="#AAA58F"
            value={eventCapacity}
            onChangeText={setEventCapacity}
            editable={!unlimitedCapacity}
            keyboardType="numeric"
            style={[
              styles.input,
              errors.eventCapacity &&
                styles.errorInput,
            ]}
          />

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() =>
              setUnlimitedCapacity(
                !unlimitedCapacity
              )
            }
          >
            <View
              style={[
                styles.checkbox,
                unlimitedCapacity &&
                  styles.checkboxActive,
              ]}
            >
              {unlimitedCapacity && (
                <Ionicons
                  name="checkmark"
                  size={12}
                  color="#FFFFFF"
                />
              )}
            </View>

            <Text style={styles.checkboxText}>
              Unlimited
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DetailsHandler;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F1E6",
    borderRadius: 18,
    padding: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#5D8A54",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#A7BF9A",
    paddingBottom: 6,
  },

  label: {
    color: "#4D644B",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    backgroundColor: "#DCD7C9",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    color: "#4D644B",
  },

  inputRow: {
    backgroundColor: "#DCD7C9",
    borderRadius: 10,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  inputRowText: {
    marginLeft: 8,
    color: "#4D644B",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  halfContainer: {
    width: "48%",
  },

  dropdown: {
    backgroundColor: "#DCD7C9",
    borderRadius: 10,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  dropdownText: {
    color: "#4D644B",
  },

  dropdownMenu: {
    backgroundColor: "#F8F5EB",
    borderRadius: 12,
    marginTop: 6,
    overflow: "hidden",
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E1D5",
  },

  dropdownItemText: {
    color: "#4D644B",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
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

  checkboxText: {
    color: "#7D8B75",
    fontSize: 13,
  },

  errorInput: {
    borderWidth: 1.5,
    borderColor: "#D9534F",
  },
});