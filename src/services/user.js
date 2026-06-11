import { db } from "../services/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function fetchCustodians() {
  const q = query(collection(db, "users"), where("role", "!=", "admin"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const d = doc.data();

    const fullname = [d.first_name, d.middle_name, d.last_name]
      .filter(Boolean)
      .join(" ");

    return {
      id: doc.id,
      username: d.user_name,
      fullname,
      role: d.role,
    };
  });
}
