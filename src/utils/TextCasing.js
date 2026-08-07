export const toProperCase = (str) =>
  str
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );

export const toLowerCase = (str) => str.toLowerCase().replace(/\s+/g, "");

export const toTitleCase = (str) =>
  str ? str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

export const toSlug = (str) => {
  let slug = str
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Firestore forbids a doc ID of exactly "." or ".."
  if (slug === "." || slug === "..") slug = `room-${slug.replace(/\./g, "dot")}`;

  // Firestore forbids IDs matching __.*__ (reserved for internal use)
  if (/^__.*__$/.test(slug)) slug = `room-${slug}`;

  // guard against empty string (e.g. name was all emoji/symbols)
  if (!slug) slug = `room-${Date.now()}`;

  return slug;
};