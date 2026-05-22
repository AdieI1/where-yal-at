import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { router, useFocusEffect } from "expo-router";

import EventCard from "../../../components/eventCard";
import {
  eventsApi,
  formatDateParts,
  formatEventTime,
  formatStatusLabel,
} from "../../../lib/api";

const buildMarkedDates = (calendarData) => {
  const marks = {};
  (calendarData?.dates || []).forEach((date) => {
    marks[date] = {
      marked: true,
      dotColor: "#4B6B4B",
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  if (marks[today]) {
    marks[today] = {
      ...marks[today],
      selected: true,
      selectedColor: "#4B6B4B",
    };
  }

  return marks;
};

const HomeScreen = () => {
  const now = new Date();
  const calendarRef = useRef({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const [currentMonth, setCurrentMonth] = useState(
    calendarRef.current.month
  );
  const [currentYear, setCurrentYear] = useState(
    calendarRef.current.year
  );
  const [markedDates, setMarkedDates] = useState({});
  const [myEvents, setMyEvents] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const loadCalendar = useCallback(async (month, year) => {
    const calendarData = await eventsApi.calendar(month, year);
    setMarkedDates(buildMarkedDates(calendarData));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        setListLoading(true);
        try {
          const { month, year } = calendarRef.current;
          const [listData, calendarData] = await Promise.all([
            eventsApi.list(),
            eventsApi.calendar(month, year),
          ]);
          if (cancelled) return;
          setMyEvents(listData.events || []);
          setMarkedDates(buildMarkedDates(calendarData));
        } catch {
          if (!cancelled) {
            setMyEvents([]);
            setMarkedDates({});
          }
        } finally {
          if (!cancelled) {
            setListLoading(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const onMonthChange = (month) => {
    const m = month.month;
    const y = month.year;

    if (
      calendarRef.current.month === m &&
      calendarRef.current.year === y
    ) {
      return;
    }

    calendarRef.current = { month: m, year: y };
    setCurrentMonth(m);
    setCurrentYear(y);

    loadCalendar(m, y).catch(() => setMarkedDates({}));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{
                uri: "https://i.pravatar.cc/150?img=12",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Hi, John!</Text>
              <Text style={styles.subText}>
                It's good to see you!{"\n"}
                Ready for today's events?
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#FFF8E7"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Event Calendar!
          </Text>
          <View style={styles.calendarContainer}>
            <Calendar
              current={`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`}
              onMonthChange={onMonthChange}
              markedDates={markedDates}
              theme={{
                backgroundColor: "#A8C39A",
                calendarBackground: "#A8C39A",
                textSectionTitleColor: "#4D644B",
                selectedDayBackgroundColor: "#4B6B4B",
                selectedDayTextColor: "#FFFFFF",
                todayTextColor: "#4B6B4B",
                dayTextColor: "#4D644B",
                monthTextColor: "#FFFFFF",
                arrowColor: "#FFFFFF",
                textDisabledColor: "#90A18C",
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle-outline"
              label="Create Event"
              onPress={() => router.push("/eventcreate")}
            />
            <QuickAction
              icon="calendar-outline"
              label="Participate Event"
            />
            <QuickAction
              icon="refresh-outline"
              label="Event history"
              onPress={() => router.push("/eventhistory")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Your events</Text>
          </View>

          {listLoading ? (
            <ActivityIndicator
              color="#7FA06F"
              style={{ marginTop: 12 }}
            />
          ) : myEvents.length === 0 ? (
            <Text style={styles.emptyText}>
              No upcoming events. Tap Create Event to add one.
            </Text>
          ) : (
            myEvents.map((item) => {
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
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const QuickAction = ({ icon, label, onPress }) => (
  <TouchableOpacity
    style={styles.actionCard}
    onPress={onPress}
  >
    <Ionicons name={icon} size={32} color="#94B28A" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9E5D8",
  },
  header: {
    backgroundColor: "#7FA06F",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subText: {
    color: "#E6F0DF",
    fontSize: 12,
    marginTop: 2,
  },
  notificationBtn: {
    borderWidth: 1,
    borderColor: "#DCE7D7",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5D7556",
    marginBottom: 12,
  },
  calendarContainer: {
    backgroundColor: "#A8C39A",
    borderRadius: 18,
    overflow: "hidden",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "#F8F5EB",
    width: "31%",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 3,
  },
  actionText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    color: "#6D7F68",
    fontWeight: "600",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyText: {
    color: "#7D8B75",
    fontSize: 14,
    marginTop: 8,
  },
});
