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
      ? new Date(value.seconds * 1000 + Math.floor(value.nanoseconds / 1_000_000))
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