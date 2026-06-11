import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA4loXVnuUrWXHPRkTM4Ya7nYSAoVYuuMY",
  authDomain: "gamified-learning-d1b24.firebaseapp.com",
  projectId: "gamified-learning-d1b24",
  storageBucket: "gamified-learning-d1b24.firebasestorage.app",
  messagingSenderId: "904623562056",
  appId: "1:904623562056:web:537d7280e3351f2ecc677d",
  measurementId: "G-61JN9GME92"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export default app;
