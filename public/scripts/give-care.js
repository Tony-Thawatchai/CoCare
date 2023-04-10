import { initialize } from "./firebase.js";
import {
  createEvent,
  createAcceptRequestNotification,
  createConfirmPickupNotification,
  updateNotificationAsRead,
  createEndTaskNotification
} from "./firebase-disable.js";
import {
  collection,
  collectionGroup,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
  doc,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const firestore = initialize().firestore;
const auth = initialize().auth;

// Variables
let signedInUserId;
let signedInUserData;
let userRequests = [];
let kidsArray = [];
let friendsArray = [];

// HTML elements
const acceptedHeader = document.getElementById("acceptedHeader");
const pendingHeader = document.getElementById("pendingHeader");
const completedHeader = document.getElementById("completedHeader");

const acceptedRequestsDiv = document.querySelector(".accepted-requests");
const pendingRequestsDiv = document.querySelector(".pending-requests");
const completedRequestsDiv = document.querySelector(".completed-requests");

const dashboardButton = document.getElementById("dashboardButton");
dashboardButton.addEventListener("click", () => {
  // to go back to pending
  hideSuccessMessage();
});

// 1. Authorization state
onAuthStateChanged(auth, (user) => {
  if (user) {
    //change menu for login user
    navLoginUser.classList.toggle("nav-login-user-active");
    navNonLoginUser.classList.toggle("nav-non-login-user-active");
    btnLogout.classList.toggle("btnLogout-acitve");
    userProfileMenu.classList.toggle("user-profile-active");
    menuItemCare.classList.toggle("menu-item-active");
    circleGiveCare.classList.add("nested-item-active");
    circleGetCare.classList.remove("nested-item-active");

    // Save user id to add later to request
    signedInUserId = user.uid;
    getSignedInUserData(user.uid);
    getReceivedRequestsForUser(user.uid);
  } else {
    // User is signed out
    console.log("user signed out");
  }
});

async function getSignedInUserData(userId) {
  const docRef = doc(firestore, "users", userId);
  const docSnap = await getDoc(docRef);
  signedInUserData = docSnap.data();
  userProfilePicMenu.setAttribute("src", signedInUserData.profileImgParent);
  userFirstNameMenu.innerHTML = signedInUserData.firstNameParent;
  userLastNameMenu.innerHTML = signedInUserData.lastNameParent;
  console.log("Signed in user data", signedInUserData);
}

// Get requests for user
async function getReceivedRequestsForUser(userUid) {
  console.log("getting received requests for user", userUid);
  const requestsQuery = query(
    collection(firestore, "care_request"),
    where("targeted_friends", "array-contains", userUid),
    orderBy("start_time")
  );
  // const requestsSnapshot = await getDocs(requestsQuery);



  const unsub = onSnapshot(requestsQuery, (requestsSnapshot) => {
    userRequests = [];
    kidsArray = [];
    friendsArray = [];

    requestsSnapshot.forEach(async (requestItem) => {
      let requestItemData = requestItem.data();
      requestItemData.id = requestItem.id;
  
      userRequests.push(requestItemData);
    });

    let allTargetedKidsIds = userRequests.flatMap(
      (request) => request.targeted_kids
    );
    let uniqueKidsIds = [...new Set(allTargetedKidsIds)]; // using a Set to remove duplicates from array
    console.log("kids ids from requests", uniqueKidsIds);
  
    console.log("Received Requests", userRequests);

    // get kids for requests
    getKidsForRequests(uniqueKidsIds);
  
    // get friends after requests
    getFriendsData(userUid);
  })

}

// Get kids for requests
async function getKidsForRequests(kidsIds) {
  console.log("getting kids data");

  const kidsQuery = query(
    collectionGroup(firestore, "kids"),
    where("id", "in", kidsIds)
  );
  const kidsQuerySnapshot = await getDocs(kidsQuery);

  // clear kids array
  kidsArray = [];

  kidsQuerySnapshot.forEach((kidDoc) => {
    kidsArray.push(kidDoc.data());
  });

  console.log("Kids array", kidsArray);
}

// Get friends data
async function getFriendsData(userId) {
  console.log("getting friends data");
  // Get friends from sub collection
  const friendsSnapshot = await getDocs(
    collection(firestore, `users/${userId}/friends`)
  );

  // create array of friend ids
  let friendIds = [];

  friendsSnapshot.forEach((friendDoc) => {
    let friendData = friendDoc.data();
    friendIds.push(friendData.FriendUID);
  });

  console.log("Friends ids", friendIds);

  // create a database query to get all friends
  const q = query(
    collection(firestore, "users"),
    where("uid", "in", friendIds)
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((shapshotItem) => {
    let friendObject = shapshotItem.data();
    friendsArray.push(friendObject);
  });

  console.log("User friends", friendsArray);

  // After getting friends, clear cards
  // After getting friends, remove existing cards
  const requestLists = document.querySelectorAll('.request-list')
  requestLists.forEach((element) => {
    element.innerHTML = '';
  })

  // draw cards for each request
  userRequests.forEach((request) => {
    drawDesktopRequestCard(request);
  });
}



function showSuccessMessage() {
  const mobileHeader = document.querySelector(".give-care-header-mobile");
  const desktopHeader = document.querySelector(".give-care-header-desktop");
  const successDiv = document.querySelector(".success");
  const requestsDiv = document.querySelector(".requests");
  const requestDetailsMobile = document.querySelector(
    ".request-details-mobile"
  );
  successDiv.classList.remove("hide");
  requestsDiv.classList.add("hide");
  requestDetailsMobile.classList.add("hide");
  mobileHeader.classList.add("hide");
  desktopHeader.classList.add("hide");
}

function hideSuccessMessage() {
  const successDiv = document.querySelector(".success");
  const requestsDiv = document.querySelector(".requests");
  const mobileHeader = document.querySelector(".give-care-header-mobile");
  const desktopHeader = document.querySelector(".give-care-header-desktop");

  successDiv.classList.add("hide");
  successDiv.classList.remove("show");

  requestsDiv.classList.remove("hide");
  mobileHeader.classList.remove("hide");
  desktopHeader.classList.remove("hide");
  requestsDiv.classList.add("show");

  pendingHeader.dispatchEvent(new Event('click'));
}

// Draw card for desktop
function drawDesktopRequestCard(request) {
  let targetedKids = kidsArray.filter((kid) =>
    request.targeted_kids.includes(kid.id)
  );
  console.log(targetedKids);

  let targetedFriend = friendsArray.find(
    (friend) => request.asker_UUID === friend.uid
  );

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("request-card", "desktop-card");
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("request-title");
  const kidNameDiv = document.createElement("div");

  targetedKids.forEach((targetedKid) => {
    kidNameDiv.innerHTML += `<div>${targetedKid.kidFirstNameadded} ${targetedKid.kidLastNameadded}, ${targetedKid.kidAgeadded}<span> years</span></div>`;
  });

  const kidSchoolDiv = document.createElement("div");
  kidSchoolDiv.innerHTML = targetedKids[0].schooladded.schoolName;
  // date
  const dateDiv = document.createElement("div");
  const convertedStartTime = new Date(request.start_time.seconds * 1000);
  const convertedEndTime = new Date(request.end_time.seconds * 1000);
  dateDiv.innerHTML = convertedStartTime.toLocaleDateString();
  // make date green if in progress
  if (request.in_progress) {
    dateDiv.classList.add("in-progress");
    dateDiv.innerHTML = "ON GOING";
  }
  // time
  const timeDiv = document.createElement("div");
  const timeOptions = { hour: "numeric", minute: "numeric" };
  const startTime = convertedStartTime.toLocaleTimeString("en-us", timeOptions);
  const endTime = convertedEndTime.toLocaleTimeString("en-us", timeOptions);
  timeDiv.innerHTML = `${startTime} - ${endTime}`;
  // open button
  const openArrowDiv = document.createElement("div");
  openArrowDiv.classList.add("open-arrow");
  openArrowDiv.innerHTML = `<i class="fa-solid fa-caret-right"></i>`;

  titleDiv.append(kidNameDiv);
  titleDiv.append(kidSchoolDiv);
  titleDiv.append(dateDiv);
  titleDiv.append(timeDiv);
  titleDiv.append(openArrowDiv);

  // Request details
  const fullDetailsDiv = document.createElement("div");
  fullDetailsDiv.classList.add("full-details", "closed");
  const careDetailsDiv = document.createElement("div");
  careDetailsDiv.innerHTML = `<h3>Care details</h3><p>${request.request_type}</p>`;
  // allergies and notes
  const notesDiv = document.createElement("div");
  const allergiesHeader = document.createElement('h3');
  allergiesHeader.innerHTML = 'Allergies and special notes';
  notesDiv.append(allergiesHeader);
  const allergies = targetedKids.flatMap((kid) => kid.allergy);
  allergies.forEach((allergy) => {
    const allergyDiv = document.createElement('p');
    allergyDiv.innerHTML = allergy;
    notesDiv.append(allergyDiv);
  })

  const locationDiv = document.createElement("div");
  locationDiv.innerHTML = `<h3>Start location</h3><p>${request.start_location}</p><h3>End location</h3><p>${request.end_location}</p>`;
  const friendsDiv = document.createElement("div");
  const friendsTitle = document.createElement("h3");
  friendsTitle.innerHTML = `Request sent by:`;
  const friendsList = document.createElement("ul");
  const friendsListItem = document.createElement("li");
  friendsListItem.innerHTML = `${targetedFriend.firstNameParent} ${targetedFriend.lastNameParent}`;
  friendsList.append(friendsListItem);
  friendsDiv.append(friendsTitle);
  friendsDiv.append(friendsList);

  fullDetailsDiv.append(careDetailsDiv);
  fullDetailsDiv.append(notesDiv);
  fullDetailsDiv.append(locationDiv);
  fullDetailsDiv.append(friendsDiv);

  // set status and append
  if (
    request.status === "accepted" &&
    request.accepted_by === signedInUserData.uid
  ) {
    cardDiv.classList.add("accepted");
    acceptedRequestsDiv.append(cardDiv);
  }

  if (request.status === "pending") {
    cardDiv.classList.add("pending");
    pendingRequestsDiv.append(cardDiv);
  }

  if (request.status === "completed") {
    cardDiv.classList.add("completed");
    completedRequestsDiv.append(cardDiv);
    dateDiv.innerHTML = convertedStartTime.toLocaleDateString();
    dateDiv.classList.remove("in-progress");
  }

  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("actions");

  // add button to decline or accept
  if (request.status === "pending") {
    let acceptRequestButton = document.createElement("button");
    acceptRequestButton.setAttribute(`id`, request.id);
    acceptRequestButton.setAttribute(`type`, `button`);
    acceptRequestButton.classList.add("action-button", "accept");
    acceptRequestButton.innerHTML = "Accept";
    acceptRequestButton.addEventListener("click", () => {
      acceptRequest(request.id);
    });
    actionsDiv.append(acceptRequestButton);

    let declineRequestButton = document.createElement("button");
    declineRequestButton.setAttribute(`id`, request.id);
    declineRequestButton.setAttribute(`type`, `button`);
    declineRequestButton.classList.add("action-button", "decline");
    declineRequestButton.innerHTML = "Decline";
    declineRequestButton.addEventListener("click", () => {
      declineRequest(request);
    });
    actionsDiv.append(declineRequestButton);
  }

  // add buttons to confirm pickup and complete
  if (request.status === "accepted") {
    let completeRequestButton = document.createElement("button");
    completeRequestButton.setAttribute(`id`, request.id);
    completeRequestButton.setAttribute(`type`, `button`);
    completeRequestButton.classList.add("action-button", "complete");
    completeRequestButton.innerHTML = "End task";
    completeRequestButton.addEventListener("click", () => {
      completeRequest(request.id);
    });
    actionsDiv.append(completeRequestButton);

    // add confirm pick up if it's not in progress yet
    if (!request.in_progress) {
      let confirmPickupButton = document.createElement("button");
      confirmPickupButton.setAttribute(`id`, request.id);
      confirmPickupButton.setAttribute(`type`, `button`);
      confirmPickupButton.classList.add("action-button", "confirm-pickup");
      confirmPickupButton.innerHTML = "Confirm pick up";
      confirmPickupButton.addEventListener("click", () => {
        confirmPickup(request.id);
      });
      actionsDiv.append(confirmPickupButton);
    }
  }

  cardDiv.append(titleDiv);
  cardDiv.append(fullDetailsDiv);
  cardDiv.append(actionsDiv);

  openArrowDiv.addEventListener("click", () => {
    if (fullDetailsDiv.classList.contains("closed")) {
      fullDetailsDiv.classList.remove("closed");
      openArrowDiv.classList.add("opened");
      actionsDiv.classList.add("opened");
    } else {
      fullDetailsDiv.classList.add("closed");
      openArrowDiv.classList.remove("opened");
      actionsDiv.classList.remove("opened");
    }
  });
}

// Select status in list
acceptedHeader.addEventListener("click", () => {
  acceptedHeader.classList.add("active");
  acceptedRequestsDiv.classList.add("active");

  completedHeader.classList.remove("active");
  completedRequestsDiv.classList.remove("active");
  pendingHeader.classList.remove("active");
  pendingRequestsDiv.classList.remove("active");
});

pendingHeader.addEventListener("click", () => {
  acceptedHeader.classList.remove("active");
  acceptedRequestsDiv.classList.remove("active");
  completedHeader.classList.remove("active");
  completedRequestsDiv.classList.remove("active");

  pendingHeader.classList.add("active");
  pendingRequestsDiv.classList.add("active");
});

completedHeader.addEventListener("click", () => {
  acceptedHeader.classList.remove("active");
  acceptedRequestsDiv.classList.remove("active");

  pendingHeader.classList.remove("active");
  pendingRequestsDiv.classList.remove("active");

  completedHeader.classList.add("active");
  completedRequestsDiv.classList.add("active");
});

// Update request status
async function acceptRequest(id) {
  console.log("updating status", id);

  const acceptedStatus = {
    status: "accepted",
    accepted_by: signedInUserData.uid,
  };

  const request = doc(firestore, `care_request/${id}`);
  // update status

  // await updateDoc(request, updatedReceivedRequestStatus);
  await updateDoc(request, acceptedStatus);

  // Create Accept Notification and Event Callendars
  await createAcceptRequestNotification(id);
  await createEvent(id);

}

async function declineRequest(request) {
  console.log("declining request", request);

  // create new array of targeted friends, without my id
  let updatedFriends = request.targeted_friends.filter(
    (friendId) => friendId !== signedInUserData.uid
  );
  console.log(updatedFriends);

  const careRequest = doc(firestore, `care_request/${request.id}`);

  const updatedTargetedFriends = {
    targeted_friends: updatedFriends,
  };

  await updateDoc(careRequest, updatedTargetedFriends);

  // Create Decline Notification
  const careRequestDoc = await getDoc(doc(firestore, `care_request/${request.id}`));
  const careRequestData = careRequestDoc.data();
  const declineNotif = await createDeclineRequestNotification(signedInUserId, careRequestData.asker_UUID, request.id);

  // refresh requests
  // refreshRequests();
}

// Confirm pickup
async function confirmPickup(id) {
  console.log("confirming pick up for request", id);

  const inProgressStatus = {
    in_progress: true,
  };

  const request = doc(firestore, `care_request/${id}`);
  // update status
  await updateDoc(request, inProgressStatus);

  
  // Create Confirm Pickup Notification
  const careRequestDoc = await getDoc(doc(firestore, `care_request/${id}`));
  const careRequest = careRequestDoc.data();
  const confirmNotif = await createConfirmPickupNotification(signedInUserId, careRequest.asker_UUID);
  

  // initialize watch location > write location data to care_request/${id}
  getRealTimeLocation(id);
}

// get real time location

let latitude;
let longitude;
let liveLocation = { lat: 49.256139, lng: -123.116389 };
let startTime;
let watchLo;
function getRealTimeLocation(id) {
  console.log("getRealTimeLocation is called");
  startTime = Date.now();

  watchLo = navigator.geolocation.watchPosition(
    (position) => {
      console.log(`location changed!!!`);

      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      console.log(position.coords);

      liveLocation = { lat: latitude, lng: longitude };

      writeLocationToDatabase(id);
    },
    (error) => {
      // failure callback is called w. error object
      console.log(error);
      if (error.code == error.PERMISSION_DENIED) {
        window.alert("geolocation permission denied");
      }
    }
  );
}

// write location to database

async function writeLocationToDatabase(id) {
  const request = doc(firestore, `care_request/${id}`);

  const locationUpdate = {
    liveLocation: liveLocation,
  };
  await updateDoc(request, locationUpdate);
}

// Complete request
async function completeRequest(id) {
  console.log("completing request", id);

  const updatedReceivedRequestStatus = {
    status: "completed",
    in_progress: false,
  };

  const request = doc(firestore, `care_request/${id}`);
  // update status
  await updateDoc(request, updatedReceivedRequestStatus);

  // update parent score
  increaseParentScore();

  showSuccessMessage();

  // Create End Task Notification
  const careRequestDoc = await getDoc(doc(firestore, `care_request/${id}`));
  const careRequest = careRequestDoc.data();
  const confirmNotif = await createEndTaskNotification(signedInUserId, careRequest.asker_UUID);

  // end watching location
  navigator.geolocation.clearWatch(watchLo);
}

function refreshRequests() {
  acceptedRequestsDiv.innerHTML = "";
  pendingRequestsDiv.innerHTML = "";
  completedRequestsDiv.innerHTML = "";
  userRequests = [];
  kidsArray = [];
  friendsArray = [];
  getReceivedRequestsForUser(signedInUserData.uid);

  // get signed in user data (to refresh score)
  getSignedInUserData(signedInUserData.uid);
}

async function increaseParentScore() {
  const updatedScore = {
    parentScore: signedInUserData.parentScore + 1,
  };

  const userRef = doc(firestore, "users", signedInUserData.uid);
  // update status
  await updateDoc(userRef, updatedScore);
}

function verifyNotificationsParameters() {
  const url = new URL(window.location.href);
  const hashedURL = url.hash.substring(1);
  const params = new URLSearchParams(hashedURL);
  const notif = params.get('n');
  if( notif === null || notif === undefined || notif === "" ) {
      console.log(`No notification provided`);
      return null;
  }else {
      const notifDoc = params.get('d');
      if( notifDoc === null || notifDoc === undefined || notifDoc === "" ) {
          console.log(`No notification document id provided`);
          return null;
      }else {
          return notifDoc;
      }
  }
}

// Initialize Give-Care Page
async function initializePage() {
  const notifParam = verifyNotificationsParameters();
  if(notifParam !== null) {
      await updateNotificationAsRead(notifParam);
  }
}

initializePage();

//mobile menu
function mobileMenu(){
  desktopMenu.classList.toggle('mobile-menu-active')
}
hamburgerBtn.addEventListener('click',mobileMenu)


// LOGOUT========
let btnLogout = document.getElementById("btnLogout");
btnLogout.addEventListener(`click`, () => {
  console.log("logout");
  logout();
});

async function logout() {
  await signOut(auth);
  window.location.href = "/";
  //   clearAuthStateToOutput();
}