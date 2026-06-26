// src/firebase/config.js
// ─────────────────────────────────────────────────────────────────────────────
// Uses REAL Firebase when VITE_FIREBASE_API_KEY is set in .env.local
// Falls back to a demo mock so the app always works without credentials.
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps }         from "firebase/app";
import { getAuth, GoogleAuthProvider,
         signInWithPopup  as fbSignIn,
         signOut          as fbSignOut,
         onAuthStateChanged as fbOnAuth }  from "firebase/auth";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
export const IS_CONFIGURED = !!(API_KEY && API_KEY !== "YOUR_API_KEY");

let auth, provider, signInWithPopup, signOut, onAuthStateChanged;

if (IS_CONFIGURED) {
  // ── Real Firebase ─────────────────────────────────────────────────────────
  const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };
  const app       = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth              = getAuth(app);
  provider          = new GoogleAuthProvider();
  signInWithPopup   = fbSignIn;
  signOut           = fbSignOut;
  onAuthStateChanged = fbOnAuth;
} else {
  // ── Mock (no credentials needed) ─────────────────────────────────────────
  auth     = {};
  provider = {};
  signInWithPopup = async () => ({
    user: { displayName: "Demo User", email: "demo@meridian.app", uid: "demo-uid-001", photoURL: null },
  });
  signOut            = async () => {};
  onAuthStateChanged = (_auth, _cb) => () => {};  // no-op unsubscribe
}

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };
