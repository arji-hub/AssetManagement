import { db } from "../services/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();

export async function fetchCustodians() {
  const q = query(collection(db, "user"), where("role", "!=", "admin"));

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

export async function addCustodian(custodianData) {
  const addCustodianFn = httpsCallable(functions, "addCustodian");
  const result = await addCustodianFn(custodianData);
  return result.data; // { uid }
}
