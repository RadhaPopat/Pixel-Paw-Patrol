import { db, auth } from "../backend/firebase-config.js";

import {

  ref,

  push,

  onValue,

  update,

  get

} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";



// ⭐ ADDED: store current username

let currentUsername = "User";



// ⭐ ADDED: get username once after login

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const snap = await get(ref(db, `users/${user.uid}/username`));

  if (snap.exists()) currentUsername = snap.val();

});



// ⭐ ADDED: save username from modal

window.saveUsername = async function () {

  const input = document.getElementById("usernameInput");

  if (!input || !input.value.trim()) {

    alert("Please enter a username");

    return;

  }



  const user = auth.currentUser;

  if (!user) return;



  await update(ref(db, `users/${user.uid}`), {

    username: input.value.trim()

  });



  currentUsername = input.value.trim();



  document.getElementById("usernameModal").style.display = "none";

  document.getElementById("usernameBackdrop").style.display = "none";

};



// ⭐ ADDED: activity helper

function addActivity(message) {

  push(ref(db, "activities"), {

    message,

    timestamp: Date.now()

  });

}



const pixelDogIcon = new L.Icon({

  iconUrl: "./img/Dog.png",

  iconSize: [40, 40],

  iconAnchor: [20, 40],

  popupAnchor: [0, -40]

});



const nirmaBounds = L.latLngBounds(

  [23.1235, 72.5360],

  [23.1355, 72.5530]

);



const map = L.map("map", {

  maxBounds: nirmaBounds,

  maxBoundsViscosity: 0.6,

  minZoom: 15,

  maxZoom: 19

}).setView([23.1295, 72.5446], 16);



L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {

  attribution: "© OpenStreetMap contributors"

}).addTo(map);



const markerLayer = L.layerGroup().addTo(map);



const reportsRef = ref(db, "reports");

const usersRef = ref(db, "users");



const activeCountEl = document.getElementById("activeCount");



onValue(reportsRef, (snapshot) => {

  let count = 0;

  snapshot.forEach(child => {

    if (child.val().status !== "resolved") count++;

  });

  activeCountEl.innerText = count;

});



onValue(reportsRef, (snapshot) => {

  markerLayer.clearLayers();



  const data = snapshot.val();

  if (!data) return;



  Object.entries(data).forEach(([id, report]) => {



    if (report.status === "resolved") return;

    if (report.animal !== "Dog") return;



    L.marker([report.lat, report.lng], { icon: pixelDogIcon })

      .addTo(markerLayer)

      .bindPopup(`

        🐕 <b>Dog Report</b><br>

        Condition: ${report.condition}<br>

        Status: <b>${report.status}</b><br><br>



        <button style="background:#7a5faf; color:white;" onclick="askDrPixel('${report.condition}')">

          🤖 Ask Dr. Pixel

        </button><br><br>



        <button onclick="updateStatus('${id}','in_progress')">

          🟡 In Progress

        </button><br><br>



        <button onclick="updateStatus('${id}','resolved')">

          🟢 Resolved

        </button>

      `);

  });

});



map.on("click", (e) => {

  if (!nirmaBounds.contains(e.latlng)) {

    alert("❌ Only inside Nirma University");

    return;

  }



  const { lat, lng } = e.latlng;



  L.popup()

    .setLatLng(e.latlng)

    .setContent(`

      <b>🐕 Report Dog</b><br><br>



      <select id="condition">

        <option>Injured</option>

        <option>Needs Water</option>

        <option>Safe</option>

      </select><br><br>



      <button onclick="saveReport(${lat},${lng})">

        Submit

      </button>

    `)

    .openOn(map);

});



window.saveReport = async function (lat, lng) {

  const user = auth.currentUser;

  if (!user) return alert("Login required");



  await push(reportsRef, {

    lat,

    lng,

    animal: "Dog",

    condition: document.getElementById("condition").value,

    status: "pending",

    userId: user.uid,

    timestamp: Date.now()

  });



  const userRef = ref(db, `users/${user.uid}`);

  const snap = await get(userRef);

  const data = snap.val() || {};



  await update(userRef, {

    reports: (data.reports || 0) + 1

  });



  // ⭐ ADDED

  addActivity(`${currentUsername} reported a dog 🐕`);



  alert("✅ Dog report submitted!");

};



window.updateStatus = async function (id, status) {

  const user = auth.currentUser;

  if (!user) return alert("Login required");



  await update(ref(db, `reports/${id}`), {

    status,

    updatedBy: user.uid,

    updatedAt: Date.now()

  });



  if (status === "resolved") {

    const userRef = ref(db, `users/${user.uid}`);

    const snap = await get(userRef);

    const data = snap.val() || {};



    await update(userRef, {

      resolved: (data.resolved || 0) + 1

    });



    // ⭐ ADDED

    addActivity(`${currentUsername} resolved a dog rescue 🐶`);

  }

};



const leaderboardEl = document.getElementById("leaderboard");



onValue(usersRef, (snapshot) => {

  leaderboardEl.innerHTML = "";



  const users = [];

  snapshot.forEach(child => users.push(child.val()));



  users

    .sort((a, b) => (b.resolved || 0) - (a.resolved || 0))

    .slice(0, 5)

    .forEach((u, i) => {

      const medal = ["🥇", "🥈", "🥉", "🏅", "🏅"][i];

      leaderboardEl.innerHTML += `

        <li>${medal} ${u.username || "User"} — ${u.resolved || 0}</li>

      `;

    });

});



// ⭐ ADDED: Activity Feed

const activityFeed = document.getElementById("activityFeed");



onValue(ref(db, "activities"), (snapshot) => {

  activityFeed.innerHTML = "";

  snapshot.forEach(child => {

    const p = document.createElement("p");

    p.textContent = "• " + child.val().message;

    activityFeed.appendChild(p);

  });

});





// Elements for your HUD

const myReportsEl = document.getElementById("myReports");

const myHelpsEl = document.getElementById("myHelps");

const heartsEl = document.getElementById("hearts");



onAuthStateChanged(auth, (user) => {

  if (!user) {

    // If no user logged in, reset HUD

    myReportsEl.innerText = "0";

    myHelpsEl.innerText = "0";

    heartsEl.innerText = "0";

    return;

  }



  // Reference to the current user's data in DB

  const userRef = ref(db, `users/${user.uid}`);



  // Listen to changes on user's data

  onValue(userRef, (snapshot) => {

    const data = snapshot.val() || {};



    // Update HUD fields, use 0 fallback

    myReportsEl.innerText = data.reports || 0;

    myHelpsEl.innerText = data.resolved || 0;



    // Hearts is same as resolved count but multiplied by 10 (just for some extra flair)

    heartsEl.innerText = (data.resolved || 0) * 10;

  });

});
// ================= GEMINI AI INTEGRATION (UPDATED) =================
window.askDrPixel = async function(condition) {
  const apiKey = "AIzaSyDS1hs8ZeDeDQWS3iyRMsGKbmyA2xFYzz4"; 
  
  // CHANGED: Using 'gemini-2.0-flash' which is the current standard
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    You are a veterinary assistant for a campus stray dog rescue app.
    A dog is reported with the condition: "${condition}".
    Provide 3 extremely short, practical, and safe steps a student can take to help.
    Keep the tone helpful and serious. Max 40 words total.
    Do not use markdown formatting like bold or italics, just plain text.
  `;

  // UI Feedback
  const modalText = document.getElementById('ai-text');
  if (modalText) {
      document.getElementById('ai-modal').style.display = 'block';
      modalText.innerText = "Thinking...";
  } else {
      alert("🤖 Dr. Pixel is thinking...");
  }

  document.getElementById('modal-backdrop').style.display = 'block'; // Show dimmer
  document.getElementById('ai-modal').style.display = 'block';     // Show popup
  document.getElementById('ai-text').innerText = "📡 Contacting Dr. Pixel...";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // ERROR HANDLING
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    // SUCCESS
    const advice = data.candidates[0].content.parts[0].text;
    
    if (modalText) {
        modalText.innerText = advice;
    } else {
        alert(`🤖 Dr. Pixel says:\n\n${advice}`);
    }

  } catch (error) {
    console.error("AI Error:", error);
    if (modalText) {
        modalText.innerText = "Error: " + error.message;
    } else {
        alert("Dr. Pixel Error: " + error.message);
    }
  }
};