import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase();

let initTimer = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // ✅ User is logged in, stop redirect timer
    if (initTimer) {
      clearTimeout(initTimer);
      initTimer = null;
    }

    // 🔍 CHECK IF USERNAME EXISTS
    const usernameRef = ref(db, `users/${user.uid}/username`);
    const snapshot = await get(usernameRef);

    if (!snapshot.exists()) {
      // 👤 Username missing → force modal
      const modal = document.getElementById("usernameModal");
      const backdrop = document.getElementById("usernameBackdrop");

      if (modal && backdrop) {
        modal.style.display = "block";
        backdrop.style.display = "block";
      }
    }

    return;
  }

  // ❌ User NOT logged in → redirect after delay
  if (!initTimer) {
    initTimer = setTimeout(() => {
      if (!auth.currentUser) {
        alert("Please login first");
        window.location.href = "./index.html";
      }
      initTimer = null;
    }, 600);
  }
});
