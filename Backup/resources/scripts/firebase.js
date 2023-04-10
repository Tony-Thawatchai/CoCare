import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";
import { getDatabase, set, ref,push, child, onValue } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { config } from "./config.js";

export function initialize() {
  const firebaseApp = initializeApp(config.firebase);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const analytics = getAnalytics(firebaseApp);
  const storage = getStorage(firebaseApp);
  const database = getDatabase(firebaseApp);


  return {
    firebaseApp,
    auth,
    firestore,
    storage,
    analytics,
    database
  };
}
