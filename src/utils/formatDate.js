export function formatDate(value) {
  if (!value) return "—";
  try {
    const date =
      typeof value === "object" && value.toDate
        ? value.toDate()
        : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}