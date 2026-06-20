import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

//check if the currentUser is logged in, their role, and other currentUser information
const AuthContext = createContext();
export { AuthContext };

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setRole(null);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "user", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUser(currentUser);
          setRole(data.role);
          setUser({
            uid: currentUser.uid,
            firstname: data.first_name,
            lastname: data.last_name,
            middlename: data.middle_name ?? "_",
            email: data.email,
            role: data.role,
            username: data.user_name,
          });
        }
      } else {
        setCurrentUser(null);
        setRole(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, role, user, loading, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
