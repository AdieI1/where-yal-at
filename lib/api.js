import Constants from "expo-constants";
import { Platform } from "react-native";

const MANUAL_HOST = "192.168.254.107";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

function getApiHost() {
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }
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

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
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

export const authApi = {
  register: (payload) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () => request("/logout", { method: "POST" }),
  me: () => request("/user"),
  updateProfile: (payload) =>
    request("/user", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

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

export function formatTime12(value) {
  if (!value) return "";

  const str = String(value);
  if (/am|pm/i.test(str)) return str;

  if (/^\d{1,2}:\d{2}/.test(str)) {
    const [hours, minutes] = str.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return str;

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatEventTime(event) {
  const sessions = event?.sessions || [];
  if (!sessions.length) return "Whole day";

  const first = sessions[0];
  const last = sessions[sessions.length - 1];
  const start = first?.time_in || first?.start_datetime;
  const end = last?.time_out || last?.end_datetime;

  if (!start) return "Whole day";

  return `${formatTime12(start)} - ${formatTime12(end || start)}`;
}

export function formatStatusLabel(status) {
  if (!status) return "Upcoming";
  const labels = {
    upcoming: "Upcoming",
    ongoing: "Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",
    present: "Present",
    late: "Late",
    absent: "Absent",
    incomplete: "Incomplete",
    pending: "Pending",
    registered: "Registered",
  };
  return (
    labels[status?.toLowerCase()] ||
    status.charAt(0).toUpperCase() + status.slice(1)
  );
}

export const ATTENDANCE_STATUS_COLORS = {
  present: { bg: "#DCE8CF", text: "#5E7C59" },
  late: { bg: "#FFE8C8", text: "#D9780D" },
  absent: { bg: "#FCEAE8", text: "#D96B5F" },
  incomplete: { bg: "#E8E0F0", text: "#7B5EA8" },
  upcoming: { bg: "#DCE8CF", text: "#5E7C59" },
  ongoing: { bg: "#DCE8CF", text: "#5E7C59" },
  completed: { bg: "#E8E8E8", text: "#7D8B75" },
};

export function getAttendanceColors(status) {
  return (
    ATTENDANCE_STATUS_COLORS[status?.toLowerCase()] ||
    ATTENDANCE_STATUS_COLORS.upcoming
  );
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
        s.session_label || s.label || `Session ${index + 1}`,
      time_in: s.time_in,
      time_out: s.time_out,
    })),
  };
}

export const eventsApi = {
  list: () => request("/events"),

  feed: (filter = "all") =>
    request(`/events/feed?filter=${filter}`),

  calendar: (month, year) =>
    request(`/events/calendar?month=${month}&year=${year}`),

  history: (filter = "all") =>
    request(`/events/history?filter=${filter}`),

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
      body: JSON.stringify({ cancellation_reason: reason }),
    }),

  join: (eventCode) =>
    request("/events/join", {
      method: "POST",
      body: JSON.stringify({ event_code: eventCode }),
    }),

  lookupByCode: (eventCode) =>
    request(
      `/events/by-code/${encodeURIComponent(
        eventCode.trim().toUpperCase()
      )}`
    ),

  timeIn: (eventId, sessionId) =>
    request(`/events/${eventId}/sessions/${sessionId}/time-in`, {
      method: "POST",
    }),

  timeOut: (eventId, sessionId) =>
    request(`/events/${eventId}/sessions/${sessionId}/time-out`, {
      method: "POST",
    }),

  participants: (eventId, { search = "", sort = "az" } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return request(
      `/events/${eventId}/participants${qs ? `?${qs}` : ""}`
    );
  },
};
