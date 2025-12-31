// database.js
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { auth, db } from "./firebase-config.js";

export async function submitAnimalReport(animalType, description, location) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to submit a report.");
    return;
  }

  const reportsRef = ref(db, "reports");
  await push(reportsRef, {
    userId: user.uid,
    animalType,
    description,
    location,
    status: "pending",
    timestamp: new Date().toISOString()
  });

  alert("Animal report submitted successfully!");
  console.log("Report submitted to RealTime Database !!!");
}
