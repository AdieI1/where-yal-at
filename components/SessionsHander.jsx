import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const to24Hour = (date) => {
  if (!date) return null;
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const SessionsHandler = ({
  eventType,
  errors,
  onSessionsChange,
}) => {
  const sessions = useMemo(
    () =>
      eventType === "Whole Day"
        ? [
            { id: 1, title: "Morning Session" },
            { id: 2, title: "Afternoon Session" },
          ]
        : [{ id: 1, title: "Session 1" }],
    [eventType]
  );

  const [labels, setLabels] = useState({});
  const [editingLabel, setEditingLabel] = useState(null);
  const [times, setTimes] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    setTimes({});
    setLabels({});
  }, [eventType]);

  useEffect(() => {
    if (!onSessionsChange) return;

    const payload = sessions.map((session) => ({
      session_label:
        labels[session.id] || session.title,
      time_in: to24Hour(
        times[`${session.id}-timeIn`]
      ),
      time_out: to24Hour(
        times[`${session.id}-timeOut`]
      ),
    }));

    onSessionsChange(payload);
  }, [times, labels, sessions, onSessionsChange]);

  const getAllowedRange = (type, sessionId) => {
    if (type === "Morning") {
      return { min: 6, max: 12 };
    }
    if (type === "Afternoon") {
      return { min: 12, max: 18 };
    }
    if (type === "Whole Day") {
      if (sessionId === 1) {
        return { min: 6, max: 12 };
      }
      if (sessionId === 2) {
        return { min: 12, max: 18 };
      }
    }
    return { min: 0, max: 23 };
  };

  const openPicker = (sessionId, field) => {
    setSelectedSession(sessionId);
    setSelectedField(field);
    setShowPicker(true);
  };

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (!selectedDate) return;

    const { min, max } = getAllowedRange(
      eventType,
      selectedSession
    );

    const correctedDate = new Date(selectedDate);
    let hour = correctedDate.getHours();

    if (hour < min) {
      correctedDate.setHours(min, 0, 0, 0);
    }
    if (hour > max) {
      correctedDate.setHours(max, 0, 0, 0);
    }

    const key = `${selectedSession}-${selectedField}`;

    setTimes((prev) => {
      const updated = {
        ...prev,
        [key]: correctedDate,
      };

      const timeIn =
        updated[`${selectedSession}-timeIn`];
      const timeOut =
        updated[`${selectedSession}-timeOut`];

      if (
        timeIn &&
        timeOut &&
        timeIn.getTime() === timeOut.getTime()
      ) {
        updated[`${selectedSession}-timeOut`] =
          null;
      }

      if (
        timeIn &&
        timeOut &&
        timeOut < timeIn
      ) {
        updated[`${selectedSession}-timeOut`] =
          null;
      }

      return updated;
    });

    setShowPicker(false);
  };

  const formatTime = (date) => {
    if (!date) return "Select";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Sessions
      </Text>

      {sessions.map((session) => (
        <View
          key={session.id}
          style={styles.sessionContainer}
        >
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>
              {session.title}
            </Text>

            {editingLabel === session.id ? (
              <TextInput
                value={labels[session.id] || ""}
                onChangeText={(text) =>
                  setLabels((prev) => ({
                    ...prev,
                    [session.id]: text,
                  }))
                }
                placeholder="Session label"
                placeholderTextColor="#8E8B82"
                style={styles.labelInput}
                onBlur={() => setEditingLabel(null)}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                onPress={() =>
                  setEditingLabel(session.id)
                }
              >
                <Text style={styles.addLabel}>
                  {labels[session.id] ||
                    "add label"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sessionRow}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>
                Time in:
              </Text>
              <TouchableOpacity
                style={[
                  styles.timeInput,
                  errors.sessions &&
                    styles.errorInput,
                ]}
                onPress={() =>
                  openPicker(
                    session.id,
                    "timeIn"
                  )
                }
              >
                <Text style={styles.timeText}>
                  {formatTime(
                    times[
                      `${session.id}-timeIn`
                    ]
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#7FA06F"
              style={styles.arrow}
            />

            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>
                Time out:
              </Text>
              <TouchableOpacity
                style={[
                  styles.timeInput,
                  errors.sessions &&
                    styles.errorInput,
                ]}
                onPress={() =>
                  openPicker(
                    session.id,
                    "timeOut"
                  )
                }
              >
                <Text style={styles.timeText}>
                  {formatTime(
                    times[
                      `${session.id}-timeOut`
                    ]
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {showPicker && (
        <DateTimePicker
          value={
            times[
              `${selectedSession}-${selectedField}`
            ] || new Date()
          }
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

export default SessionsHandler;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
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
  sessionContainer: {
    marginBottom: 20,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6D6D6D",
  },
  addLabel: {
    fontSize: 16,
    color: "#8E8B82",
    textDecorationLine: "underline",
    marginLeft: 6,
  },
  labelInput: {
    marginLeft: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#8E8B82",
    minWidth: 100,
    color: "#6D6D6D",
    paddingVertical: 2,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  timeContainer: {
    width: "42%",
  },
  timeLabel: {
    marginBottom: 6,
    color: "#6D6D6D",
  },
  timeInput: {
    backgroundColor: "#DCD7C9",
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  timeText: {
    color: "#4D644B",
  },
  arrow: {
    marginBottom: 10,
  },
  errorInput: {
    borderWidth: 1.5,
    borderColor: "#D9534F",
  },
});
