// auth.js
import { auth, db } from "./firebase-config.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  ref,
  get,
  set
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ================= LOADER =================
function toggleLoading(show) {
  const loader = document.getElementById("loading-overlay");
  if (loader) loader.style.display = show ? "flex" : "none";
}

// ================= EMAIL LOGIN =================
export function emailSignIn(email, password) {
  if (!email || !password) {
    alert("Please enter both email and password!");
    return;
  }

  toggleLoading(true);

  setPersistence(auth, browserSessionPersistence)
    .then(() => signInWithEmailAndPassword(auth, email, password))
    .catch(err => {
      toggleLoading(false);
      alert("Login Failed: " + err.message);
    });
}

// ================= EMAIL SIGN UP =================
export function emailSignUp(email, password) {
  if (!email || !password) {
    alert("Please enter both email and password!");
    return;
  }

  toggleLoading(true);

  setPersistence(auth, browserSessionPersistence)
    .then(() => createUserWithEmailAndPassword(auth, email, password))
    .catch(err => {
      toggleLoading(false);
      alert("Sign Up Failed: " + err.message);
    });
}

// ================= GOOGLE SIGN IN =================
export function googleSignIn() {
  toggleLoading(true);

  const provider = new GoogleAuthProvider();

  setPersistence(auth, browserSessionPersistence)
    .then(() => signInWithPopup(auth, provider))
    .catch(err => {
      toggleLoading(false);
      alert("Google Sign-In Failed: " + err.message);
    });
}

// ================= LOGOUT =================
export function logout() {
  signOut(auth)
    .then(() => {
      window.location.href = "./index.html";
    })
    .catch(err => alert(err.message));
}

// ================= AUTH STATE LISTENER =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    toggleLoading(false);
    console.log("❌ No active session");
    return;
  }

  console.log("✅ Logged in:", user.email);

  try {
    const userRef = ref(db, `users/${user.uid}`);
    const snap = await get(userRef);

    // Create DB profile ONLY ONCE
    if (!snap.exists()) {
      await set(userRef, {
        displayName: user.displayName || "Rescuer",
        email: user.email,
        role: "user",
        reports: 0,
        resolved: 0,
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error("❌ Database error:", err);
  }

  // Redirect ONLY if user is on public page
  const path = window.location.pathname;

  if (
    path.endsWith("/index.html") ||
    path === "/" ||
    path.endsWith("/frontend") ||
    path.endsWith("/frontend/")
  ) {
    window.location.href = "./map.html";
  }
});

// ================= GLOBALS FOR HTML =================
window.googleSignIn = googleSignIn;
window.emailSignIn = emailSignIn;
window.emailSignUp = emailSignUp;
window.logout = logout;
