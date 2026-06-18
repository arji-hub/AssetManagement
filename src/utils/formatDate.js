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
