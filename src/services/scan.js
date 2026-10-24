import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase-config";

const scanAcquisitionDocFn = httpsCallable(functions, "scanAcquisitionDoc", {
  timeout: 90_000,
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function scanAcquisitionDoc(file, acquisitionType, categories) {
  const imageBase64 = await fileToBase64(file);
  const { data } = await scanAcquisitionDocFn({
    imageBase64,
    mimeType: file.type,
    acquisitionType,
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
  });
  return data;
}
