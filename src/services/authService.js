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

  return credentials.user;
}

export async function signInWithEmail({ name, email, password, role }) {
  const credentials = await signInWithEmailAndPassword(auth, email, password);

  if (name && credentials.user.displayName !== name) {
    await updateProfile(credentials.user, {
      displayName: name
    });
  }

  await saveUserProfile({
    uid: credentials.user.uid,
    name: name || credentials.user.displayName || "Skill Park User",
    role,
    emailOrId: email
  });

  return credentials.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function getFriendlyFirebaseError(error) {
  const code = error?.code || "";

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
