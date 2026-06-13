import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { initializeProgress } from "./progressService";

const USERS_COLLECTION = "users";

function buildUserPayload({ uid, name, role, emailOrId }) {
  return {
    uid,
    name,
    role,
    emailOrId,
    updatedAt: serverTimestamp()
  };
}

export async function saveUserProfile({ uid, name, role, emailOrId }) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const existingSnapshot = await getDoc(userRef);

  if (!existingSnapshot.exists()) {
    await setDoc(userRef, {
      ...buildUserPayload({ uid, name, role, emailOrId }),
      createdAt: serverTimestamp()
    });
    return;
  }

  await updateDoc(userRef, buildUserPayload({ uid, name, role, emailOrId }));
}

export async function getUserProfile(uid) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
}

export async function signUpWithEmail({ name, email, password, role }) {
  const credentials = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credentials.user, {
    displayName: name
  });

  await saveUserProfile({
    uid: credentials.user.uid,
    name,
    role,
    emailOrId: email
  });

  // Initialize progress for students
  if (role === 'student') {
    try {
      await initializeProgress(credentials.user.uid, name);
      console.log("Progress initialized for new student");
    } catch (error) {
      console.error("Failed to initialize progress:", error);
    }
  }

  return credentials.user;
}

export async function signInWithEmail({ name, email, password, role }) {
  const credentials = await signInWithEmailAndPassword(auth, email, password);

  // Get the actual user profile from Firestore
  const existingProfile = await getUserProfile(credentials.user.uid);
  
  if (!existingProfile) {
    // New user - should not happen during sign in, but handle it
    throw new Error("User profile not found. Please sign up first.");
  }

  // Use the role from the database, NOT the one from the form
  const actualRole = existingProfile.role;
  const actualName = name || existingProfile.name || credentials.user.displayName || "User";

  // Verify that the role matches what the user selected
  if (role && role !== actualRole) {
    // User tried to login with wrong role
    await signOut(auth);
    throw new Error(`This account is registered as a ${actualRole}. Please select the correct role.`);
  }

  // Update profile with actual stored role
  if (actualName && credentials.user.displayName !== actualName) {
    await updateProfile(credentials.user, {
      displayName: actualName
    });
  }

  // Update last login info asynchronously (don't wait)
  updateDoc(doc(db, USERS_COLLECTION, credentials.user.uid), {
    name: actualName,
    role: actualRole,
    emailOrId: email,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  }).catch(err => console.error("Failed to update login timestamp:", err));

  // Initialize progress for students asynchronously (don't block signin)
  if (actualRole === 'student') {
    import('./progressService').then(async ({ getUserProgress, initializeProgress: initProg }) => {
      try {
        let progress = await getUserProgress(credentials.user.uid);
        if (progress && progress.userName === "Student") {
          await initProg(credentials.user.uid, actualName);
          console.log(`Progress name updated to: ${actualName}`);
        }
        console.log("Student progress check:", progress ? "exists" : "initialized");
      } catch (error) {
        console.error("Failed to check/initialize progress:", error);
      }
    });
  }

  return credentials.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function getFriendlyFirebaseError(error) {
  const code = error?.code || "";
  const message = error?.message || "";

  // Handle custom role mismatch error
  if (message.includes("registered as a")) {
    return message;
  }

  if (message.includes("User profile not found")) {
    return message;
  }

  if (code.includes("email-already-in-use")) {
    return "This email is already registered. Please sign in instead.";
  }

  if (code.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }

  if (code.includes("weak-password")) {
    return "Password should be at least 6 characters.";
  }

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Incorrect email or password. Please try again.";
  }

  if (code.includes("network-request-failed")) {
    return "Network issue detected. Please check your connection and try again.";
  }

  return "Something went wrong while connecting to Firebase.";
}
