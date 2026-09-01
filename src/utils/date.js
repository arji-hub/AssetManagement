export function formatDate(value) {
  if (!value) return "—";

  try {
    let date;

    // Firestore Timestamp
    if (value?.toDate) {
      date = value.toDate();
    }
    // { seconds, nanoseconds } format
    else if (value?.seconds) {
      date = new Date(value.seconds * 1000);
    }
    // normal date / string / number
    else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatDateTime(value) {
  const date =
    value?.seconds !== undefined
      ? new Date(
          value.seconds * 1000 + Math.floor(value.nanoseconds / 1_000_000),
        )
      : new Date(value);

  if (isNaN(date)) return "Invalid date";

  const datePart = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timePart = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${datePart} -- ${timePart}`;
}

export const displayDate = new Date()
  .toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  .toUpperCase();

export const todayISO = new Date().toISOString().split("T")[0];

export function splitDateTime(value) {
  const combined = formatDateTime(value);
  if (combined === "Invalid date") return { date: "—", time: "" };

  const [date, time] = combined.split(" -- ");
  return { date, time };
}

export function toSortableDate(value) {
  if (value?.toDate) return value.toDate();
  if (value?.seconds !== undefined) return new Date(value.seconds * 1000);
  const d = new Date(value);
  return isNaN(d) ? new Date(0) : d;
}

export function getTimeValue(created_at) {
  if (!created_at) return 0;
  if (typeof created_at.toDate === "function")
    return created_at.toDate().getTime();
  if (typeof created_at.seconds === "number") return created_at.seconds * 1000;
  if (created_at instanceof Date) return created_at.getTime();
  const parsed = new Date(created_at).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatTime(value) {
  if (!value) return "—";

  try {
    let date;

    // Firestore Timestamp with .toDate() method
    if (typeof value?.toDate === "function") {
      date = value.toDate();
    }
    // Firestore Timestamp { seconds, nanoseconds }
    else if (value?.seconds !== undefined) {
      date = new Date(
        value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1_000_000)
      );
    }
    // Standard Date, ISO string, or numeric timestamp
    else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}