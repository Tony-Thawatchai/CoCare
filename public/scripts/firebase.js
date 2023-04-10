import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import { getDatabase, set, ref,push, child, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging.js";
import { getFunctions } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-functions.js';
import { config } from "./config.js";

export function initialize() {
  const firebaseApp = initializeApp(config.firebase);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  
  // enableIndexedDbPersistence(firestore);
  
  const analytics = getAnalytics(firebaseApp);
  const storage = getStorage(firebaseApp);
  const database = getDatabase(firebaseApp);
  const messaging = getMessaging(firebaseApp);
  const functions = getFunctions(firebaseApp);


  return {
    firebaseApp,
    auth,
    firestore,
    storage,
    analytics,
    database,
    messaging,
    functions
  };
}