import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { getUserProfile } from "../services/authService";
import { clearAuthProfile, getAuthProfile, saveAuthProfile } from "../services/localStorageService";

export function useAuthSession() {
  const [session, setSession] = useState({
    loading: true,
    profile: getAuthProfile()
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearAuthProfile();
        setSession({ loading: false, profile: null });
        return;
      }

      const localProfile = getAuthProfile();
      if (localProfile?.uid === user.uid) {
        setSession({ loading: false, profile: localProfile });
        return;
      }

      // Restore profile after refresh when Firebase auth is active but localStorage is empty.
      const firestoreProfile = await getUserProfile(user.uid);
      if (firestoreProfile) {
        const profile = {
          uid: firestoreProfile.uid,
          name: firestoreProfile.name,
          role: firestoreProfile.role,
          emailOrId: firestoreProfile.emailOrId
        };
        saveAuthProfile(profile);
        setSession({ loading: false, profile });
        return;
      }

      setSession({ loading: false, profile: null });
    });

    return unsubscribe;
  }, []);

  return session;
}
