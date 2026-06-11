
export const toProperCase = (str) =>
  str
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\w\S*/g, (word) =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

export const toLowerCase = (str) => str.toLowerCase().replace(/\s+/g, "");