// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";


const firebaseConfig = {
  apiKey: "AIzaSyCceIKk4vrkQEpglifrcA4Mx6UobXfl6HA",
  authDomain: "animalhelp-techsprint.firebaseapp.com",
  databaseURL: "https://animalhelp-techsprint-default-rtdb.firebaseio.com",
  projectId: "animalhelp-techsprint",
  storageBucket: "animalhelp-techsprint.firebasestorage.app",
  messagingSenderId: "960608754754",
  appId: "1:960608754754:web:91d4527982bbd70f1e21db",
  measurementId: "G-59VXRE2HVQ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getDatabase(app);
