import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLh6Khjtixvb2zDy66YOio8s-N42_doHc",
  authDomain: "ams-cict.firebaseapp.com",
  projectId: "ams-cict",
  storageBucket: "ams-cict.firebasestorage.app",
  messagingSenderId: "103823553863",
  appId: "1:103823553863:web:b948b147a353ed824ac862",
  measurementId: "G-VEHE9RQQSN",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
