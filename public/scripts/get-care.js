import { initialize } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
  doc,
  deleteDoc,
  onSnapshot,
  limit,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { updateNotificationAsRead } from "./firebase-disable.js";

const firestore = initialize().firestore;
const auth = initialize().auth;

// Variables
let signedInUserId;
let signedInUserData;
let userRequests = [];
let kidsArray = [];
let friendsArray = [];

// draw a map of live location from giver user


// Variables >>>> map
let latitude;
let longitude;
let liveLocation = { lat: 49.256139, lng: -123.116389 };
// let liveLocation = { };
console.log(liveLocation);
let routeCoordinates = [];
let startTime;
const symbolOne = {
  path: "M -2,0 0,-2 2,0 0,2 z",
  strokeColor: "#F00",
  fillColor: "#F00",
  fillOpacity: 1,
};
const symbolTwo = {
  path: "M -2,-2 2,2 M 2,-2 -2,2",
  strokeColor: "#292",
  strokeWeight: 4,
};
const symbolThree = {
  path: "M -2,0 0,-2 2,0 0,2 z",
  strokeColor: "gold",
  fillColor: "gold",
  fillOpacity: 1,
};

// HTML elements

const acceptedHeader = document.getElementById("acceptedHeader");
const pendingHeader = document.getElementById("pendingHeader");
const completedHeader = document.getElementById("completedHeader");

const acceptedRequestsDiv = document.querySelector(".accepted-requests");
const pendingRequestsDiv = document.querySelector(".pending-requests");
const completedRequestsDiv = document.querySelector(".completed-requests");

// 1. Authorization state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User", user);
    //change menu for login user
    navLoginUser.classList.toggle("nav-login-user-active");
    navNonLoginUser.classList.toggle("nav-non-login-user-active");
    btnLogout.classList.toggle("btnLogout-acitve");
    userProfileMenu.classList.toggle("user-profile-active");
    menuItemCare.classList.toggle("menu-item-active");

    // Save user id to add later to request
    signedInUserId = user.uid;
    getSignedInUserData(user.uid);
    getKidsData(user.uid);
    getSentRequestsForUser(user.uid);
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

// Get kids data
async function getKidsData(userId) {
  // Get kids from sub collection
  const kidsSnapshot = await getDocs(
    collection(firestore, `users/${userId}/kids`)
  );

  kidsSnapshot.forEach((kidObject) => {
    let kid = kidObject.data();
    kid.uid = kidObject.id;
    kidsArray.push(kid);
  });

  console.log("User kids", kidsArray);
}

// Get requests for user
async function getSentRequestsForUser(userUid) {
  console.log("getting requests for user", userUid);

  const requestsQuery = query(
    collection(firestore, "care_request"),
    where("asker_UUID", "==", userUid),
    orderBy("start_time")
  );

  const requestsSnapshot = await getDocs(requestsQuery);

  requestsSnapshot.forEach((requestItem) => {
    let requestItemData = requestItem.data();
    requestItemData.id = requestItem.id;
    userRequests.push(requestItemData);
  });
  console.log("Requests", userRequests);

  // After requests get user's friends
  getFriendsData(userUid);
}

// Get friends data
async function getFriendsData(userId) {
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

// Desktop request card
function drawDesktopRequestCard(request) {
  console.log('Request id', request.id);

  let targetedKidId = request.targeted_kids[0];
  let targetedKid = kidsArray.find((kid) => kid.uid === targetedKidId);
  let targetedFriends = friendsArray.filter((friend) =>
    request.targeted_friends.includes(friend.uid)
  );
  console.log("targeted friends", targetedFriends);

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("request-card", "desktop-card");
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("request-title");
  const kidNameDiv = document.createElement("div");

  // filter selected kids
  let targetedKidsArray = kidsArray.filter((kid) =>
    request.targeted_kids.includes(kid.uid)
  );
  console.log('targeted kids', targetedKidsArray)

  targetedKidsArray.forEach((targetedKid) => {
    let paragraph = document.createElement("div");
    paragraph.innerHTML = `${targetedKid.kidFirstNameadded} ${targetedKid.kidLastNameadded}, ${targetedKid.kidAgeadded}<span> years</span>`;
    kidNameDiv.append(paragraph);
  });

  const kidSchoolDiv = document.createElement("div");
  kidSchoolDiv.innerHTML = targetedKid.schooladded.schoolName;
  // date
  const dateDiv = document.createElement("div");
  const convertedStartTime = new Date(request.start_time.seconds * 1000);
  const convertedEndTime = new Date(request.end_time.seconds * 1000);
  dateDiv.innerHTML = convertedStartTime.toLocaleDateString();

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
  const allergies = targetedKidsArray.flatMap((kid) => kid.allergy);
   // need to list all
  allergies.forEach((allergy) => {
    const allergyDiv = document.createElement('p');
    allergyDiv.innerHTML = allergy;
    notesDiv.append(allergyDiv);
  })

  const locationDiv = document.createElement("div");
  locationDiv.innerHTML = `<h3>Start location</h3><p>${request.start_location}</p><h3>End location</h3><p>${request.end_location}</p>`;
  const friendsDiv = document.createElement("div");
  const friendsTitle = document.createElement("h3");
  friendsTitle.innerHTML = `Request sent to:`;
  const friendsList = document.createElement("ul");


  if (request.targeted_friends.length === 0) {
    friendsList.innerHTML = `<li class="declined">DECLINED</li>`;
  } else {
    request.targeted_friends.forEach((friendId) => {
      const friendsListItem = document.createElement("li");
      const targetedFriend = friendsArray.find(
        (friend) => friend.uid === friendId
      );
      friendsListItem.innerHTML = `${targetedFriend.firstNameParent} ${targetedFriend.lastNameParent}`;
      friendsList.append(friendsListItem);
    });
  }

  friendsDiv.append(friendsTitle);
  friendsDiv.append(friendsList);

  fullDetailsDiv.append(careDetailsDiv);
  fullDetailsDiv.append(notesDiv);
  fullDetailsDiv.append(locationDiv);
  fullDetailsDiv.append(friendsDiv);
 
  // make date green if in progress
  if (request.in_progress === true) {
    let map = document.createElement("div");
    map.setAttribute("id", "map");
    map.setAttribute("class", "map");
    fullDetailsDiv.append(map);
    console.log("add map div");
    
    dateDiv.classList.add("in-progress");
    dateDiv.innerHTML = "ON GOING";
    console.log(request);
    console.log(request.liveLocation);
    checkLocation(request);

    // call map box , onSnapshot listen to location change in  care_request/${id} > draw marker
    // initMap()
    // initializeMap();

    let apiKey = "";

    // Create the script tag, set the appropriate attributes
    let script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&region=CA&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Append the 'script' element to 'head'
    document.head.appendChild(script);

    window.initMap = initMap;
    
    // console.log(request.id);
    // initMarker(request.id);
  }

  // set status and append
  if (request.status === "accepted") {
    cardDiv.classList.add("accepted");
    // change text to accepted by
    friendsTitle.innerHTML = `Request accepted by:`;
    // only show friend which accepted request
    const friendWhoAccepted = targetedFriends.find((friend) => friend.uid === request.accepted_by)
    friendsList.innerHTML = `<li>${friendWhoAccepted.firstNameParent} ${friendWhoAccepted.lastNameParent}`;

    acceptedRequestsDiv.append(cardDiv);
  }

  if (request.status === "pending") {
    cardDiv.classList.add("pending");
    pendingRequestsDiv.append(cardDiv);
  }

  if (request.status === "completed") {
    cardDiv.classList.add("completed");
    // chage header to completed by
    friendsTitle.innerHTML = `Request completed by:`;
    // only show friend who completed === friend who accepted
    const friendWhoAccepted = targetedFriends.find((friend) => friend.uid === request.accepted_by)
    friendsList.innerHTML = `<li>${friendWhoAccepted.firstNameParent} ${friendWhoAccepted.lastNameParent}`;

    completedRequestsDiv.append(cardDiv);
    dateDiv.innerHTML = convertedStartTime.toLocaleDateString();
    dateDiv.classList.remove("in-progress");
  }

  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("actions");

  // add button to delete request
  if (request.status === "pending") {
    let deleteRequestButton = document.createElement("button");
    deleteRequestButton.setAttribute(`id`, request.id);
    deleteRequestButton.setAttribute(`type`, `button`);
    deleteRequestButton.classList.add("action-button", "delete");
    deleteRequestButton.innerHTML = "Delete request";
    deleteRequestButton.addEventListener("click", () => {
      deleteRequest(request.id);
    });
    actionsDiv.append(deleteRequestButton);
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


// function initializeMap();

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

// Delete request
async function deleteRequest(id) {
  console.log("deleting request", id);

  const request = doc(firestore, `care_request/${id}`);
  // update status
  await deleteDoc(request);


  // update parent score (restore one point)
  increaseParentScore();

  // refresh requests
  refreshRequests();
}

function refreshRequests() {
  acceptedRequestsDiv.innerHTML = "";
  pendingRequestsDiv.innerHTML = "";
  completedRequestsDiv.innerHTML = "";
  userRequests = [];
  kidsArray = [];
  friendsArray = [];

  getSentRequestsForUser(signedInUserData.uid);
  getKidsData(signedInUserData.uid);

  // get signed in user data (to refresh score)
  getSignedInUserData(signedInUserData.uid);
}

// Increase parent score
async function increaseParentScore() {
  const updatedScore = {
    parentScore: signedInUserData.parentScore + 1,
  };

  const userRef = doc(firestore, "users", signedInUserData.uid);
  // update status
  await updateDoc(userRef, updatedScore);
}

//mobile menu
function mobileMenu() {
  desktopMenu.classList.toggle("mobile-menu-active");
}
hamburgerBtn.addEventListener("click", mobileMenu);



// check locaiton change from another user


async function checkLocation(request) {
  console.log(request);
  const q = query(
    collection(firestore, "care_request"),
    where("requestID", "==", request.requestID), limit(10)
  );
  
 
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    // const cities = [];
    querySnapshot.forEach((doc) => {
      liveLocation = doc.data().liveLocation;
      console.log(doc.data())
      routeCoordinates.push(liveLocation);
    });
    console.log(liveLocation);
    console.log(routeCoordinates)
    initMarker()
  });
}


// Initialize and add the map
let map;
function initMap() {
  // The map
  map = new google.maps.Map(document.getElementById("map"), {
  // const map = new google.maps.Map(document.getElementsByClassName("map"), {
    zoom: 13,
    center: liveLocation,
  });
  initMarker();
}


// Initialize and add the map
function initMarker() {
  // console.log(liveLocation);
  //   The map
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: liveLocation,
  });

  //   The marker
  const symbolFour = {
    path: google.maps.SymbolPath.CIRCLE,
    strokeColor: "hotpink",
    fillColor: "hotpink",
    fillOpacity: 1,
    scale: 2,
    strokeWeight: 1,
  };
  const marker = new google.maps.Marker({
    position: liveLocation,
    map: map,
    icon: symbolFour,

    // icons: [
    //   // {
    //   //   icon: symbolFour,
    //   // },
    //   {
    //     icon: imgFlag,
    //   },
    // ],
  });

  const routePath = new google.maps.Polyline({
    path: routeCoordinates,
    icons: [
      {
        icon: symbolOne,
        offset: "0%",
      },
      {
        icon: symbolFour,
        offset: "100%",
      },
      {
        icon: symbolThree,
        offset: "0%",
      },
    ],
    geodesic: true,
    strokeColor: "red",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });


  routePath.setMap(map);
  animateIcon(routePath);
  animateMarker(marker);
}

function animateMarker(marker) {
  console.log (`animateMarker`)
  let count = 1;
  window.setInterval(() => {
    count = (count + 1) % 50;
    const animatedMarker = marker.get("icon");
    animatedMarker.strokeWeight = count;
    marker.set("icon", animatedMarker);
    // const icons = line.get("icons");

    // icons[2].offset = count / 2 + "%";
    // line.set("icons", icons);
  }, 20);
}

function animateIcon(line) {
  console.log(`animateIcon`)
  let count = 0;

  window.setInterval(() => {
    count = (count + 1) % 200;
    const icons = line.get("icons");

    icons[2].offset = count / 2 + "%";
    line.set("icons", icons);
  }, 20);
}

// Notification
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
  console.log(notifParam);
  if(notifParam !== null) {
      await updateNotificationAsRead(notifParam);
      acceptedHeader.dispatchEvent(new Event("click"));
  }
  // pendingHeader.dispatchEvent(new Event("click"));
}

initializePage();

// LOGOUT========
let btnLogout = document.getElementById("btnLogout");
btnLogout.addEventListener(`click`, () => {
  console.log("logout");
  logout();
  // location.replace("/");
});


async function logout() {
  await signOut(auth);
  window.location.href = "/";
  //   clearAuthStateToOutput();
}
