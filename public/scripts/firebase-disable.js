import { initialize } from "./firebase.js";
import {
  initializeApp,
  getApps
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";

import { 
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  setDoc,
  query,
  startAfter,
  where,
  Timestamp,
  collectionGroup,
  addDoc,
  deleteDoc,
  updateDoc,
  limit
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

import {
  getMessaging,
  getToken
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging.js";

import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-functions.js';

//Temporary Holder ========================== TODO
import { getStorage } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import { getDatabase, set, ref,push, child, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Initialize firebase config and firebase connection ========= TODO
// Group Config
// const firebaseConfig = {
//   apiKey: "AIzaSyBBsmT10AHv_gj0qciOJEbScHWjbN9Yy88",
//   authDomain: "cocare-d7fc8.firebaseapp.com",
//   databaseURL: "https://cocare-d7fc8-default-rtdb.firebaseio.com",
//   projectId: "cocare-d7fc8",
//   storageBucket: "cocare-d7fc8.appspot.com",
//   messagingSenderId: "244715203746",
//   appId: "1:244715203746:web:7f4eea0c4e3e8b52de3bfb",
//   measurementId: "G-TGJ1B58X86"
// };

// function initializeServices() {
//   const isConfigured = getApps().length > 0;
//   const firebaseApp = initializeApp(firebaseConfig);
//   const auth = getAuth(firebaseApp);
//   const firestore = getFirestore(firebaseApp);
//   const storage = getStorage(firebaseApp);
//   const analytics = getAnalytics(firebaseApp);
//   const database = getDatabase(firebaseApp);
//   const messaging = getMessaging(firebaseApp);
//   const functions = getFunctions(firebaseApp);

//   return { isConfigured, firebaseApp, auth, firestore, storage, analytics, database, messaging, functions};
// }

export function getFirebase() {
  const services = initialize();
  // if(!services.isConfigured) {
  // }
  return services;
}

export function onAuth(callback) {
  const { auth } = getFirebase();
  return onAuthStateChanged(auth, user => {
    callback(user);
  });
}

export function fbsignOut() {
  const { auth } = getFirebase();
  onAuth(user => {
    if(user) {
      signOut(auth).then(() => {
        console.log(`Successfully logged out, ${user.uid}`);
        console.log(`Redirecting to homepage/signin`);
      }).catch((err) => {
        console.log(`Error logging out. please check logs`);
        console.log(`Redirecting to homepage/signin`);
        console.log(err);
      });
    }
  });
}

export function signIn(username, password) {
  const { auth } = getFirebase();
  let signin_cb;
  try {
    signin_cb = signInWithEmailAndPassword(auth, username, password);
    return signin_cb;
  }catch(err) {
    console.log(err);
  }
}

export async function requestPushNotification() {
  const { messaging, auth, firestore } = getFirebase();
  // Request permission and get token.....
  let token;
  try {
    token = await getToken(messaging,{vapidKey: "BFKsunGiEwGbZ417o2DTkXsae4foSj33TkBqdOobOelueosa1fs7ONUkpl-VXWuoPvvYwUDo10I3HN8OAbuugbo"});
    // If token is not null, save token to server
    if(token) {
      if(auth.currentUser) {
        const { uid } = auth.currentUser;
        const userRef = doc(firestore, "users", uid);
        const userDoc = await getDoc(userRef);
        // Chech if user exists in database
        if(userDoc.exists()) {
          const userDocData = userDoc.data();
          // Check if token already exists in database
          if(userDocData && userDocData.notification_token === token) {
            console.log(`Token already sent to server`);
            return true;
          // If token does not exist in database then save token to database
          }else {
            await setDoc(userRef, {notification_token: token}, {merge: true});
            console.log(`Token sent to server`);
            return true;
          }
        // If user does not exist in database
        }else {
          console.log(`User does not exist in database`);
          return false;
        }
      }
    }
  }catch(err) {
    // Notification permission denied
    console.log(`Error getting token`, err);
    return false
  }
}

export async function queryNotification(arr, onNewNotifDisplay) {
  try {
    const { firestore, auth } = getFirebase();
    console.log(await auth.currentUser.getIdToken());
    const { uid } = auth.currentUser;
    const notifRef = collection(firestore, "notifications", uid, "notifs");
    const q = await query(notifRef, orderBy("notification_timestamp", "asc"));
    const unsubscribe = await onSnapshot(q, (querySnapshot) => {
      querySnapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          arr.unshift(change.doc.data());
          // TODO ========= Uncomment this to send push notification when user is not on the page
          // if( !document.hidden ) {
          //   console.log(`User is on the page but hidden`);
          //   const receiver_token = await getUserToken(uid);
          //   sendPushNotification(receiver_token, change.doc.data());
          // }
        }
        onNewNotifDisplay();
      });
    });
    return unsubscribe;
  }catch(err){
    console.log(err);
  }
}

// TODO ========= Uncomment this to send push notification when user is not on the page
export async function sendPushNotification(receiver_token, notification) {
  // console.log(receiver_token);
  // let { auth, functions } = getFirebase();
  // try {
  //   // clean up notification data before sending to server
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
  //   }

  //   const data = {
  //     data: {
  //       notification: {
  //         title: notification.notification_header,
  //         body: notification.notification_body
  //       },
  //       token: receiver_token
  //     }
  //   };

  //   // Initialize callable cloud function
  //   const sendNotification = httpsCallable(functions, 'sendnotification', {headers});
  //   const response = await sendNotification(data);
  //   console.log(response);
  //   // const response = await sendNotification(data);
  // } catch(err) {
  //   console.log(err);
  // }
}

export async function getUserToken(userid) {
  try {
    const { firestore } = getFirebase();
    const userRef = doc(firestore, "users", userid);
    const userDoc = await getDoc(userRef);
    if(userDoc.exists()) {
      const userDocData = userDoc.data();
      if(userDocData) {
        return userDocData.notification_token;
      }
    }
  }catch(err) {
    console.log('Error Fetching data: ', err);
  }
}
// Dashboard Firebase Functions ===============================================
export async function displayRandomUsers(num) {
  const { auth } = getFirebase();
  let arr = [];
  const users = await getRandomUsers(auth.currentUser.uid, num);
  if (users.length === 0){
    arr = 0
    return arr
  }
  users.forEach((user) => {
    arr.push(user);
  });
  return arr;
}

export async function getRandomUsers(excludeUserId, num) {
  const { firestore } = getFirebase();
  let userFirstKidSchoolPlaceID = null;
  // Query User Collection to get kids schoolplaceID
  try {
    const userRef = collection(firestore, "users", excludeUserId, "kids");
    const userDoc = await getDocs(userRef);
    const userDocData = userDoc.docs.map((doc) => doc.data());
    userFirstKidSchoolPlaceID = userDocData[0].schooladded.schoolPlaceID;
    const kidsRef = collectionGroup(firestore, "kids");
    const q = query(kidsRef, where('schooladded.schoolPlaceID', '==', userFirstKidSchoolPlaceID));
    const querySnapshot = await getDocs(q);

    const parentUserDocRefs = querySnapshot.docs.map((doc) => doc.ref.parent.parent);
    const parentUserDocSnapshot = await Promise.all(parentUserDocRefs.map(getDoc));
    const parentUserDocs = parentUserDocSnapshot.filter((doc) => doc.exists());
    const users = parentUserDocs.map((doc) => ({...doc.data(), id: doc.id}));
    const filteredUsers = users.filter((user) => user.id !== excludeUserId);

    const uniqueUsers = filteredUsers.filter((user, index, self) => {
      return self.findIndex((u) => u.id === user.id) === index;
    });

    const shuffledUsers = shuffleArray(uniqueUsers);

    return shuffledUsers.slice(0, num);
  }catch(err) {
    console.log(err);
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Profile Firebase Functions =================================================
export async function getUserProfile(id) {
  const { firestore } = getFirebase();
  const userRef = doc(firestore, "users", id);
  const userDoc = await getDoc(userRef);
  if(userDoc.exists()) {
    const userDocData = userDoc.data();
    if(userDocData) {
      return userDocData;
    }
  }
  return null;
}

// Temp function to get user profile
export async function getProfile(id) {
  const { firestore } = getFirebase();
  const userRef = doc(firestore, "users", id);
  const userDoc = await getDoc(userRef);
  if(userDoc.exists()) {
    const userDocData = userDoc.data();
    if(userDocData) {
      return userDocData;
    }
  }
  return null;
}

export async function verifyUserFriend(userID) {
  const { firestore, auth } = getFirebase();
  const friendListRef = doc(firestore, "users", auth.currentUser.uid, "friends", userID);
  try {
    // Query for friend document in friend list subcollection of user document
    const querySnapshot = await getDoc(friendListRef);
    if(querySnapshot.exists()) {
      // If friend document exists, return friend
      return 'friend';
    } else {
      // If friend document does not exist, check friend_requests subcollection
      const friendRequestRef = doc(firestore, "users", auth.currentUser.uid, "friend_request", userID);
      const requestQuerySnapshot = await getDoc(friendRequestRef);
      if(requestQuerySnapshot.exists()) {
        // If friend request document exists, check if friend request is from user
        const requestQuerySnapshotData = requestQuerySnapshot.data();
        if ( requestQuerySnapshotData.friendRequestFromUid === auth.currentUser.uid ) {
          return 'friendrequest';
        } else {
          return 'friendrequestpending';
        }
      }
      // If friend request document does not exist, return notfriend
      return 'notfriend';
    }
  }catch(err) {
    // If error, return notfriend and log error
    return 'notfriend';
    console.log(err);
  }
}

export async function addFriendRequest(friendRequestID) {
  const { firestore, auth } = getFirebase();
  const user = await getUserProfile(auth.currentUser.uid);
  const friend_request_user = await getUserProfile(friendRequestID);

  // Create a friend request document for both users
  try {
    const userRequestRef = doc(firestore, "users", user.uid, "friend_request", friendRequestID);
    const friendRequestRef = doc(firestore, "users", friendRequestID, "friend_request", user.uid);

    // Create friend request object for user
    const friendRequestFrom = {
      friendRequestFromEmail: friend_request_user.email,
      friendRequestFromFirstNameParent: friend_request_user.firstNameParent,
      friendRequestFromLastNameParent: friend_request_user.lastNameParent,
      friendRequestFromProfileImgParent: friend_request_user.profileImgParent,
      friendRequestFromUid: user.uid,
      requestStatus: true
    }

    // Create friend request object for friend
    const friendRequestTo = {
      friendRequestFromEmail : user.email,
      friendRequestFromFirstNameParent : user.firstNameParent,
      friendRequestFromLastNameParent : user.lastNameParent,
      friendRequestFromProfileImgParent : user.profileImgParent,
      friendRequestFromUid : user.uid,
      requestStatus : true
    }

    // Add friend request object to user and friend document
    const addToFriendRequest = await setDoc(friendRequestRef, friendRequestTo, {merge: true});
    const addToUserFriendRequest = await setDoc(userRequestRef, friendRequestFrom, {merge: true});

    // Log friend request sent
    console.log(`Friend request sent to ${friend_request_user.firstNameParent} ${friend_request_user.lastNameParent}`);

    // Create a notification for the friend request
    createFriendRequestNotification(user.uid, friendRequestID);

    return true;
    // const addToFriendRequestRef = await setDoc(friendRequestRef, friendRequestFrom, {merge: true});
  }catch(err) {
    console.log(err);
    return false;
  }
}

export async function cancelFriendRequest(friendRequestID) {
  const { firestore, auth } = getFirebase();
  const user = await getUserProfile(auth.currentUser.uid);
  const friend_request_user = await getUserProfile(friendRequestID);

  // Delete a friend request document for both users
  try {
    const userRequestRef = doc(firestore, "users", user.uid, "friend_request", friendRequestID);
    const friendRequestRef = doc(firestore, "users", friendRequestID, "friend_request", user.uid);

    // Delete friend request object for user
    const deleteFromFriendRequest = await deleteDoc(userRequestRef);
    const deleteFromUserFriendRequest = await deleteDoc(friendRequestRef);

    // Log friend request canceled
    console.log(`Friend request canceled to ${friend_request_user.firstNameParent} ${friend_request_user.lastNameParent}`);

    return true;
  }catch(err) {
    console.log(err);
    return false;
  }
}

export async function acceptFriendRequest(friendRequestID) {
  const { firestore, auth } = getFirebase();
  const user = await getUserProfile(auth.currentUser.uid);
  const friend_request_user = await getUserProfile(friendRequestID);

  // Create a friend document for both users
  try {
    const userFriendRef = doc(firestore, "users", user.uid, "friends", friendRequestID);
    const friendFriendRef = doc(firestore, "users", friendRequestID, "friends", user.uid);

    // Create friend object for friend
    const newFriendObject = {
      FriendUID: user.uid,
      friendFirstName: user.firstNameParent,
      friendLastName: user.lastNameParent,
      friendProfileImgParent: user.profileImgParent,
      friendSchoolAuthorized: null,
      friendStatus: true
    }

    // Create friend object for user
    const userFriendObject = {
      FriendUID: friendRequestID,
      friendFirstName: friend_request_user.firstNameParent,
      friendLastName: friend_request_user.lastNameParent,
      friendProfileImgParent: friend_request_user.profileImgParent,
      friendSchoolAuthorized: null,
      friendStatus: true
    }

    // Add friend object to user and friend document
    const addToFriendDocument = await setDoc(friendFriendRef, newFriendObject, {merge: true});
    const addToUserFriendDocument = await setDoc(userFriendRef, userFriendObject, {merge: true});

    // Delete friend request document for both users
    await cancelFriendRequest(friendRequestID);

    // Log friend request accepted
    console.log(`Friend request accepted from ${friend_request_user.firstNameParent} ${friend_request_user.lastNameParent}`);

    // Create a notification for the accepted friend request
    createFriendAcceptNotification(user.uid, friendRequestID);
    return true;
  }catch(err) {
    console.log(err);
    return false;
  }
}

export async function deleteFriend(friendID) {
  const { firestore, auth } = getFirebase();
  const user = await getUserProfile(auth.currentUser.uid);
  const friend = await getUserProfile(friendID);

  // Delete a friend document for both users
  try {
    const userFriendRef = doc(firestore, "users", user.uid, "friends", friendID);
    const friendFriendRef = doc(firestore, "users", friendID, "friends", user.uid);

    // Delete friend object for user
    const deleteFromFriendDocument = await deleteDoc(userFriendRef);
    const deleteFromUserFriendDocument = await deleteDoc(friendFriendRef);

    // Log friend deleted
    console.log(`Friend deleted from ${friend.firstNameParent} ${friend.lastNameParent}`);

    return true;
  }catch(err) {
    console.log(err);
    return false;
  }
}

// Messags Firebase Functions =================================================
export async function getConversations(uid) {
  try {
    const { firestore } = getFirebase();
    const conversationsRef = collection(firestore, "conversations");
    const q = await query(conversationsRef,
      where("members", "array-contains", uid),
      orderBy("last_message.timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    const conversations = await querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));
    return conversations;
  }catch(err) {
    console.log(err);
    return null;
  }
}

export async function getConversationList(arr, onNewConversationDisplay) {
  try {
    const { firestore, auth } = getFirebase();
    const { uid } = auth.currentUser;
    const conversationsRef = collection(firestore, "conversations");
    const q = await query(conversationsRef,
      where("members", "array-contains", uid),
      orderBy("last_message.timestamp", "desc"),
    );
    const unsubscribe = await onSnapshot(q, (querySnapshot) => {
      querySnapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          arr.unshift( {...change.doc.data(), id: change.doc.id} );
        }
        if (change.type === "modified") {
          const index = arr.findIndex((conversation) => conversation.id === change.doc.id);
          arr[index] = { ...change.doc.data(), id: change.doc.id};
        }
        if (change.type === "removed") {
          const index = arr.findIndex((conversation) => conversation.id === change.doc.id);
          arr.splice(index, 1);
        }
        onNewConversationDisplay();
      });
    });
    return unsubscribe;
  }catch(err) {
    console.log(err);
    return null;
  }
}

export async function getConversationWith(uid, otherUserID) {
  try {
    const { firestore } = getFirebase();
    const conversationsRef = collection(firestore, "conversations");
    const q = await query(conversationsRef, 
      where("members", "array-contains", uid),
      orderBy("last_message.timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    const conversations = await querySnapshot.docs
      .map((doc) => ({...doc.data(), id: doc.id}))
      .filter((conversation) => conversation.members.includes(otherUserID));
    
    console.log(conversations);
    return conversations;
  }catch (err) {
    console.log(err);
  }
}

export async function getMessages(conversationID, arr, onNewMessageDisplay) {
  try {
    const { firestore } = getFirebase();
    const messagesRef = collection(firestore, "messages", conversationID, "text");
    const q = await query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const messagesUnsub = await onSnapshot(q, (querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          arr.push(change.doc.data());
          onNewMessageDisplay();
        }
      });
  });
    return messagesUnsub;
  }catch (err) {
    console.log(err);
  }
}

export async function getDashboardConversations() {
  try {
    const { firestore, auth } = getFirebase();
    const { uid } = auth.currentUser;
    const conversationsRef = collection(firestore, "conversations");
    const q = await query(conversationsRef,
      where("members", "array-contains", uid),
      orderBy("last_message.timestamp", "desc"),
      limit(3)
    );
    const querySnapshot = await getDocs(q);
    const conversations = await querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));

    return conversations;
  }catch(err) {
    console.log(err);
    return null;
  }
}

export async function sendMessage(conversationID, message) {
  // Create a conversation document if it doesn't exist
}

/* Sample Call to createEvent =================================================
createEvent("hv4Vag5bgWQ38dJMNaiaOtTyMZt2", "DFPNbMzPdXjCuBVCiKvy", {
  care_request_docID: "DFPNbMzPdXjCuBVCiKvy",
  event_type: "Give/Receive",
  event_name: "Test Event",
  event_description: "Test Event Description",
  event_geolocation: "Test Event Geolocation",
  timestamp: Timestamp.now()
}); */
export async function createEvent(documentID) {
  const { firestore, auth } = getFirebase();
  
  // Verify if the document is available
  const requestRef = doc(firestore, "care_request", documentID);
  try {
    const requestDoc = await getDoc(requestRef);
    // If document is not found, return false and exit function
    if(!requestDoc.exists()) {
      console.log("Document not found inside care_request collection");
      return false; 
    }
    // If document is found, create a document event for both members
    const request = requestDoc.data();

    const eventAskerRef = collection(firestore, "events", request.asker_UUID, "evt");
    const eventGiverRef = collection(firestore, "events", request.targeted_friends[0], "evt");

    const newEventAsker = await addDoc(eventAskerRef, {
      care_request_docID: documentID,
      event_type: "getcare",
      event_name: request.request_type,
      event_description: request.request_desctiption,
      event_geolocation: request.start_location,
      event_date: request.start_date,
      timestamp: Timestamp.now()
    });

    const newEventGiver = await addDoc(eventGiverRef, {
      care_request_docID: documentID,
      event_type: "givecare",
      event_name: request.request_type,
      event_description: request.request_desctiption,
      event_geolocation: request.start_location,
      event_date: request.start_date,
      timestamp: Timestamp.now()
    });

    console.log(`New event added to Asker: ${newEventAsker.id}`);
    console.log(`New event added to Giver: ${newEventGiver.id}`);

    if( newEventAsker && newEventGiver ) {
      console.log("Event added to Database successfully");
      return true;
    } else {
      console.log("Event not added to Database");
      return false;
    }
  }catch(err) {
    console.log(err);
    return false;
  }
}

/* Sample Call to getEvents ===================================================
getEvents(new Date(2023, 03, 1), new Date(2023, 03 + 1, 1)); */
export async function getEvents(startDate, endDate) {
  const { firestore, auth } = getFirebase();
  const { uid } = auth.currentUser;
  const eventRef = collection(firestore, "events", uid, "evt");
  const q = query(eventRef, where("timestamp", ">=", startDate), where("timestamp", "<=", endDate));
  const querySnapshot = await getDocs(q);
  const eventsList = [];

  querySnapshot.forEach((doc) => {
      eventsList.push(doc.data());
  });
  return eventsList;
}

// for future proofing
export async function createNotification(documentID, notificationType){
  switch(notificationType) {
    case "friend_request":
      console.log("Friend Request Notification")
      break;
    case "friend_request_accepted":
      console.log("Friend Request Accepted Notification")
      break;
    case "friend_request_rejected":
      console.log("Friend Request Rejected Notification");
      break;
    case "care_request":
      console.log("Care Request Notification");
      break;
    case "care_request_accepted":
      console.log("Care Request Accepted Notification");
      break;
    case "care_request_rejected":
      console.log("Care Request Rejected Notification");
      break;
    default:
      console.log("Notification type not found");
      return;
  }
}

/* Sample Call to createFriendRequestNotification ============================
  createAcceptRequestNotification("DFPNbMzPdXjCuBVCiKvy");
*/
export async function createAcceptRequestNotification(documentID) {
  const { firestore, auth } = getFirebase();
  
  // Verify if the document is available
  const requestRef = doc(firestore, "care_request", documentID);
  try {
    const requestDoc = await getDoc(requestRef);
    // If document is not found, return false and exit function
    if(!requestDoc.exists()) {
      console.log("Document not found inside care_request collection");
      return false; 
    }
    const request = requestDoc.data();

    const userRef = doc(firestore, "users", request.targeted_friends[0]);
    const userDoc = await getDoc(userRef);

    if(!userDoc.exists()) {
      console.log("Document not found inside users collection");
      return false;
    }

    const user = userDoc.data();

    const notificationAskerRef = collection(firestore, "notifications", request.asker_UUID, "notifs");
    const notificationResponse = await addDoc(notificationAskerRef, {
      notification_body: `Care request accepted by ${user.firstNameParent} ${user.lastNameParent}!`,
      notification_header: `Care Request Accepted`,
      notification_type: "care_request_accepted",
      notification_document: documentID,
      notification_timestamp: Timestamp.now(),
      notification_flag: false,
      notification_url: `/get-care#`
    });
    console.log(notificationResponse);
  }
  catch(err){
      console.log(err);
  }
}

/* Sample Call to createFriendRequestNotification ============================
*/
export function createFriendRequestNotification(selfID, requestUserID){
  const { firestore } = getFirebase();
  return new Promise(async (resolve, reject) => {
    try {
      // Get the profile of both the user and the requested user
      const selfProfile = await getProfile(selfID);
      const requestUserProfile = await getProfile(requestUserID);
  
      // Get the notification collection of the requested user
      const notificationRef = collection(firestore, "notifications", requestUserID, "notifs");
      const notificationResponse = await addDoc(notificationRef, {
        notification_body: `${selfProfile.firstNameParent} ${selfProfile.lastNameParent} has sent you a friend request!`,
        notification_header: `Friend Request`,
        notification_type: "friend_request",
        notification_document: selfID,
        notification_url: "/profile#",
        // notification_url: "/profiles?u=" + selfID,
        notification_flag: false,
        notification_timestamp: Timestamp.now()
      });
      console.log(notificationResponse);
      resolve(true);
    }catch(err){
      console.log(err);
      reject(false);
    }
  });
}

/* Sample Call to createFriendAcceptNotification  */
export async function createFriendAcceptNotification(selfID, requestUserID){
  const { firestore } = getFirebase();
  try {
    // Get the profile of both the user and the requested user
    const selfProfile = await getUserProfile(selfID);
    const requestUserProfile = await getUserProfile(requestUserID);

    // Get the notification collection of the requested user
    const notificationRef = collection(firestore, "notifications", requestUserID, "notifs");
    const notificationResponse = await addDoc(notificationRef, {
      notification_body: `${selfProfile.firstNameParent} ${selfProfile.lastNameParent} has accepted your friend request!`,
      notification_header: `Friend Request Accepted`,
      notification_type: "friend_request_accepted",
      notification_url: "/profile#",
      // notification_url: "/profiles?u=" + selfID,
      notification_document: selfID,
      notification_flag: false,
      notification_timestamp: Timestamp.now()
    });
    console.log(notificationResponse);
    return true;
  }catch(err){
    console.log(err);
    return false;
  }
}

export async function createConfirmPickupNotification(selfID, requestID) {
  const { firestore } = getFirebase();
  return new Promise(async (resolve, reject) => {
    try {
      // Get the profile of both the user and the requested user
      const selfProfile = await getUserProfile(selfID);
      const requestUserProfile = await getUserProfile(requestID);
  
      // Get the notification collection of the requested user
      const notificationRef = collection(firestore, "notifications", requestID, "notifs");
      const notificationResponse = await addDoc(notificationRef, {
        notification_body: `${selfProfile.firstNameParent} ${selfProfile.lastNameParent} has confirmed pickup!`,
        notification_header: `Pickup Confirmed`,
        notification_type: "pickup_confirmed",
        notification_document: selfID,
        notification_url: "/get-care#",
        notification_flag: false,
        notification_timestamp: Timestamp.now()
      });
      resolve(true);
    }catch(err){
      console.log(err);
      reject(false);
    }
  });
}

export async function createDeniedRequestNotification(selfID, requestID) {
  const { firestore } = getFirebase();
  return new Promise(async (resolve, reject) => {
    try {
      // Get the profile of both the user and the requested user
      const selfProfile = await getUserProfile(selfID);
      const requestUserProfile = await getUserProfile(requestID);
  
      // Get the notification collection of the requested user
      const notificationRef = collection(firestore, "notifications", requestID, "notifs");
      const notificationResponse = await addDoc(notificationRef, {
        notification_body: `${selfProfile.firstNameParent} ${selfProfile.lastNameParent} has denied your request!`,
        notification_header: `Request Denied`,
        notification_type: "request_denied",
        notification_document: selfID,
        notification_url: "/get-care#",
        notification_flag: false,
        notification_timestamp: Timestamp.now()
      });
      resolve(true);
    }catch(err){
      console.log(err);
      reject(false);
    }
  });
}

export async function createEndTaskNotification(selfID, requestID) {
  const { firestore } = getFirebase();
  return new Promise(async (resolve, reject) => {
    try {
      // Get the profile of both the user and the requested user
      const selfProfile = await getUserProfile(selfID);
      const requestUserProfile = await getUserProfile(requestID);
  
      // Get the notification collection of the requested user
      const notificationRef = collection(firestore, "notifications", requestID, "notifs");
      const notificationResponse = await addDoc(notificationRef, {
        notification_body: `${selfProfile.firstNameParent} ${selfProfile.lastNameParent} has ended the task!`,
        notification_header: `Task Ended`,
        notification_type: "task_ended",
        notification_document: selfID,
        notification_url: "/get-care#",
        notification_flag: false,
        notification_timestamp: Timestamp.now()
      });
      resolve(true);
    }catch(err){
      console.log(err);
      reject(false);
    }
  });
}

export async function updateNotificationAsRead(docID) {
  const { firestore, auth } = getFirebase();
  return new Promise(async (resolve, reject) => {
    try {
      const notificationRef = doc(firestore, "notifications", auth.currentUser.uid, "notifs", docID);
      const notificationDoc = await getDoc(notificationRef);
      if(!notificationDoc.exists()) {
        console.log("Document not found inside notifications collection");
        reject(false);
      }
      const notification = notificationDoc.data();
      const notificationUpdate = {
        notification_flag: true
      }
      const updateResponse = await updateDoc(notificationRef, notificationUpdate);
      console.log(updateResponse);
      resolve(true);
    }catch(err) {
      console.log(err);
      reject(false);
    }
  });
}