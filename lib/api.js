import Constants from "expo-constants";
import { Platform } from "react-native";

/** Change this to your PC's LAN IP when testing on a physical phone. */
const MANUAL_HOST = "192.168.254.107";

function getApiHost() {
  // Android emulator: 10.0.2.2 reaches the host machine's localhost
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }

  // iOS simulator can use localhost
  if (Platform.OS === "ios") {
    return "127.0.0.1";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }

  return MANUAL_HOST;
}

export const API_BASE = `http://${getApiHost()}:8000/api`;

const REQUEST_TIMEOUT_MS = 15000;

/** Normalize expo-router params (string | string[]). */
export function routeParam(value) {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Is the API server running?");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.message ||
      (typeof data.errors === "object"
        ? Object.values(data.errors).flat().join(", ")
        : null) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export function normalizeEventType(type) {
  const map = {
    "Whole Day": "Whole day",
    "Half Day": "Half day",
  };
  return map[type] || type;
}

export function formatDateParts(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return {
    month: d
      .toLocaleString("default", { month: "short" })
      .toUpperCase(),
    day: String(d.getDate()),
  };
}

export function formatEventTime(event) {
  const sessions = event?.sessions || [];
  if (!sessions.length) {
    return "Whole day";
  }

  const first = sessions[0];
  const last = sessions[sessions.length - 1];
  const start = first?.time_in || first?.start_datetime;
  const end = last?.time_out || last?.end_datetime;

  if (!start) {
    return "Whole day";
  }

  const fmt = (value) => {
    if (!value) return "";
    if (value.length <= 5) return value;
    return new Date(value).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return `${fmt(start)} - ${fmt(end || start)}`;
}

export function formatStatusLabel(status) {
  if (!status) return "Upcoming";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function buildCreatePayload({
  eventName,
  eventLocation,
  eventType,
  selectedDate,
  eventCapacity,
  unlimitedCapacity,
  allowLateCheckIn,
  autoAbsent,
  sessions,
}) {
  const date =
    selectedDate instanceof Date
      ? selectedDate.toISOString().slice(0, 10)
      : selectedDate;

  return {
    event_name: eventName.trim(),
    event_location: eventLocation.trim(),
    event_date: date,
    event_type: normalizeEventType(eventType),
    capacity: unlimitedCapacity
      ? null
      : parseInt(eventCapacity, 10) || null,
    unlimited_capacity: unlimitedCapacity,
    allow_late_checkin: allowLateCheckIn,
    auto_mark_absent: autoAbsent,
    sessions: (sessions || []).map((s, index) => ({
      session_label:
        s.session_label ||
        s.label ||
        `Session ${index + 1}`,
      time_in: s.time_in,
      time_out: s.time_out,
    })),
  };
}

export const eventsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams({
      creator_id: "1",
      ...params,
    }).toString();
    return request(`/events?${qs}`);
  },

  calendar: (month, year) =>
    request(
      `/events/calendar?creator_id=1&month=${month}&year=${year}`
    ),

  history: () => request("/events/history?creator_id=1"),

  get: (id) => request(`/events/${id}`),

  create: (payload) =>
    request("/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    request(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  cancel: (id, reason) =>
    request(`/events/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({
        cancellation_reason: reason,
      }),
    }),
};
