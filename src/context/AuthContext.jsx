import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext({ user: undefined, refreshUser: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return unsubscribe;
  }, []);

  // Forces a re-render after updateProfile by spreading the current user
  // into a new object, since Firebase mutates it in-place without triggering
  // React's change detection.
  function refreshUser() {
    if (auth.currentUser) setUser({ ...auth.currentUser });
  }

  return (
    <AuthContext.Provider value={{ user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hooks are intentionally co-located with their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext).user;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRefreshUser() {
  return useContext(AuthContext).refreshUser;
}
