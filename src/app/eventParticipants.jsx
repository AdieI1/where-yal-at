import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import {
  eventsApi,
  getAttendanceColors,
  routeParam,
} from "../../lib/api";
import { COLORS } from "../../constants/theme";

const SORT_OPTIONS = [
  { key: "az", label: "A-Z" },
  { key: "time_in_asc", label: "Earliest time in" },
  { key: "time_in_desc", label: "Latest time in" },
];

function TimeCell({ value, status }) {
  if (!value) {
    return <Text style={styles.naText}>--</Text>;
  }
  const colors = getAttendanceColors(status);
  return (
    <Text style={[styles.timeCell, { color: colors.text }]}>
      {value}
    </Text>
  );
}

export default function EventParticipants() {
  const params = useLocalSearchParams();
  const eventId = routeParam(params.id);
  const eventTitle = routeParam(params.title) || "Event";

  const [participants, setParticipants] = useState([]);
  const [counts, setCounts] = useState({
    present: 0,
    late: 0,
    absent: 0,
    incomplete: 0,
  });
  const [phase, setPhase] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("az");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadParticipants = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await eventsApi.participants(eventId, {
        search: search.trim(),
        sort,
      });
      setParticipants(data.participants || []);
      setCounts(
        data.status_counts || {
          present: 0,
          late: 0,
          absent: 0,
          incomplete: 0,
        }
      );
      setPhase(data.phase || "upcoming");
    } catch (e) {
      setError(e.message);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [eventId, search, sort]);

  useFocusEffect(
    useCallback(() => {
      loadParticipants();
    }, [loadParticipants])
  );

  useEffect(() => {
    if (!eventId) return undefined;
    const timer = setTimeout(() => loadParticipants(), 350);
    return () => clearTimeout(timer);
  }, [search, sort, eventId, loadParticipants]);

  const sortLabel =
    SORT_OPTIONS.find((o) => o.key === sort)?.label || "A-Z";

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
            color={COLORS.darkGreen}
          />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Event Participants</Text>
          <Text style={styles.headerSubtitle}>{eventTitle}</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search Participant"
        placeholderTextColor={COLORS.textMuted}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={loadParticipants}
        returnKeyType="search"
      />

      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowSortMenu((v) => !v)}
      >
        <Text style={styles.sortLabel}>Sort by: {sortLabel}</Text>
        <Ionicons
          name={showSortMenu ? "chevron-up" : "chevron-down"}
          size={18}
          color={COLORS.darkGreen}
        />
      </TouchableOpacity>

      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.sortOption}
              onPress={() => {
                setSort(option.key);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sort === option.key && styles.sortOptionActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.countRow}>
        {[
          { key: "present", label: "Present" },
          { key: "late", label: "Late" },
          { key: "absent", label: "Absent" },
          { key: "incomplete", label: "Incomp." },
        ].map((item) => {
          const colors = getAttendanceColors(item.key);
          return (
            <View
              key={item.key}
              style={[
                styles.countBox,
                { backgroundColor: colors.bg },
              ]}
            >
              <Text
                style={[styles.countLabel, { color: colors.text }]}
              >
                {item.label}
              </Text>
              <Text
                style={[styles.countValue, { color: colors.text }]}
              >
                {counts[item.key] ?? 0}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, styles.nameCol]}>Name</Text>
        <Text style={styles.colHeader}>Time in:</Text>
        <Text style={styles.colHeader}>Time Out:</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginTop: 24 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {participants.map((row) => (
            <View key={row.participant_id} style={styles.tableRow}>
              <Text style={[styles.nameCell, styles.nameCol]}>
                {row.name}
              </Text>
              <View style={styles.timeCol}>
                <TimeCell
                  value={row.time_in_display}
                  status={row.time_in_status}
                />
              </View>
              <View style={styles.timeCol}>
                <TimeCell
                  value={row.time_out_display}
                  status={row.time_out_status}
                />
              </View>
            </View>
          ))}
          {participants.length === 0 && (
            <Text style={styles.emptyText}>
              {phase === "upcoming"
                ? "No attendance data yet — event has not started."
                : "No participants found."}
            </Text>
          )}
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.darkGreen,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.darkGreen,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D8D4C4",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  sortLabel: {
    color: COLORS.darkGreen,
    fontWeight: "600",
  },
  sortMenu: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0DDD0",
  },
  sortOptionText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  sortOptionActive: {
    color: COLORS.darkGreen,
    fontWeight: "700",
  },
  countRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  countBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  countLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  countValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#C9D3C0",
    marginBottom: 8,
  },
  colHeader: {
    flex: 1,
    fontWeight: "800",
    color: COLORS.darkGreen,
    fontSize: 13,
  },
  nameCol: {
    flex: 1.4,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4D8",
  },
  nameCell: {
    flex: 1.4,
    color: "#727272",
    fontSize: 14,
    fontWeight: "500",
  },
  timeCol: {
    flex: 1,
  },
  timeCell: {
    fontSize: 13,
    fontWeight: "700",
  },
  naText: {
    color: "#B0B0B0",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 24,
    fontSize: 14,
  },
  errorText: {
    textAlign: "center",
    color: COLORS.danger,
    marginTop: 24,
  },
});
