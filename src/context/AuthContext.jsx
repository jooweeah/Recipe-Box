import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext({ user: null, loading: true, refreshUser: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      setLoading(false);
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
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hooks are intentionally co-located with their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const { user, loading } = useContext(AuthContext);
  return { user, loading };
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRefreshUser() {
  return useContext(AuthContext).refreshUser;
}
