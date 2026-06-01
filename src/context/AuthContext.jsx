import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

//check if the user is logged in, their role, and other user information
const AuthContext = createContext();

export function AuthProvider({ children }) {
  console.log("AuthProvider is rendering");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setUserInfo(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser(user);
          setRole(data.role);
          setUserInfo({
            firstname: data.first_name,
            lastname: data.last_name,
            email: data.email,
            role: data.role,
            username: data.user_name,
          });
        }
      } else {
        setUser(null);
        setRole(null);
        setUserInfo(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, userInfo, loading, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
