import { initialize } from "./firebase.js";
import { createNotification } from "./firebase-disable.js";
import {
  collection,
  collectionGroup,
  setDoc,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const firestore = initialize().firestore;
const auth = initialize().auth;

const requestType = document.querySelector("#type");
const requestDetails = document.querySelector("#request-details");
const childDetails = document.querySelector("#child-details");
const friendDetails = document.querySelector("#friend-details");
const date = document.querySelector("#date");
const startTime = document.querySelector("#start-time");
const endTime = document.querySelector("#end-time");
const startLocation = document.querySelector("#start-location");
const endLocation = document.querySelector("#end-location");
const output = document.querySelector("#help-request-card");

const outputRequestType = document.querySelector("#request-type-output");
const outputKidsDetails = document.querySelector("#kids-details-output-list");
const outputFriendsDetails = document.querySelector("#friends-details-output");
const outputRequestDetails = document.querySelector("#request-details-output");
const outputDate = document.querySelector("#date-output");
const outputStartTime = document.querySelector("#start-time-output");
const outputEndTime = document.querySelector("#end-time-output");
const outputStartLocation = document.querySelector("#start-location-output");
const outputEndLocation = document.querySelector("#end-location-output");

const nextButton = document.querySelector("#next");
const backButton = document.querySelector("#back");
const submitButton = document.querySelector("#submit");
const dashboardButton = document.querySelector("#dashboard");

let signedInUserId;
let signedInUserData;
let kidsArray = [];
let friendsArray = [];
let requestForm;
// add onAuthStateChanged


// 1. Authorization state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    // ...
    console.log(user);

    //change menu for login user
    navLoginUser.classList.toggle("nav-login-user-active");
    navNonLoginUser.classList.toggle("nav-non-login-user-active");
    btnLogout.classList.toggle("btnLogout-acitve");
    userProfileMenu.classList.toggle("user-profile-active");
    menuItemCare.classList.toggle("menu-item-active");

    // Save user id to add later to request
    signedInUserId = user.uid;
    getSignedInUserData(user.uid);
    getKidsData(user);
    getFriendsData(user);
  } else {
    // User is signed out
    console.log("user signed out");
  }
});

async function getSignedInUserData(userId) {
  const docRef = doc(firestore, "users", userId);
  const docSnap = await getDoc(docRef);
  signedInUserData = docSnap.data()
  userProfilePicMenu.setAttribute("src", signedInUserData.profileImgParent);
  userFirstNameMenu.innerHTML = signedInUserData.firstNameParent;
  userLastNameMenu.innerHTML = signedInUserData.lastNameParent;
  console.log('Signed in user data', signedInUserData)
}

// 2. Get kids and friends information from database
// https://firebase.google.com/docs/firestore/query-data/queries#simple_queries
async function getKidsData(user) {
  // Get kids from sub collection
  const kidsSnapshot = await getDocs(
    collection(firestore, `users/${user.uid}/kids`)
  );

  kidsSnapshot.forEach((kidObject) => {
    let kid = kidObject.data();
    kid.uid = kidObject.id;

    kidsArray.push(kid);
  });

  displayKidDetails();
}

async function getFriendsData(user) {
  // Get friends from sub collection
  const friendsSnapshot = await getDocs(
    collection(firestore, `users/${user.uid}/friends`)
  );

  // create array of friend ids
  let friendIds = [];

  friendsSnapshot.forEach((friendDoc) => {
    let friendData = friendDoc.data();
    friendIds.push(friendData.FriendUID);
  });

  console.log(friendIds);

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

  displayFriendsDetails();
}

// Create a checkbox of each kid in html
function displayKidDetails() {
  console.log(kidsArray);

  // create checkboxes here for each kid
  for (let kid of kidsArray) {
    let label = document.createElement("label");
    let labelTitle = document.createElement("span");
    labelTitle.innerHTML = kid.kidFirstNameadded;
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "kid-checkbox";
    checkbox.name = kid.uid;
    checkbox.value = kid.uid;
    checkbox.id = kid.uid;
    label.append(checkbox);
    label.append(labelTitle);
    childDetails.append(label);
  }
}

// Create a checkbox of each friend in html
function displayFriendsDetails() {
  console.log("friends array:", friendsArray);

  // create checkboxes here for each friend
  for (let friend of friendsArray) {
    let label = document.createElement("label");
    let labelTitle = document.createElement("span");
    labelTitle.innerHTML = `${friend.firstNameParent} ${friend.lastNameParent}`;
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "friend-checkbox";
    checkbox.name = friend.uid;
    checkbox.value = friend.uid;
    checkbox.id = friend.uid;
    label.append(checkbox);
    label.append(labelTitle);
    friendDetails.append(label);
  }
}

// Next button
nextButton.addEventListener("click", (event) => {
  event.preventDefault();

  // create start time from date and time
  let startDateTime = new Date(`${date.value} ${startTime.value}`);
  console.log("start date and time", startDateTime);

  // create end time from date and time
  let endDateTime = new Date(`${date.value} ${endTime.value}`);
  console.log("start date and time", endDateTime);

  // check which kids are checked and add to request
  let targetedKids = [];

  for (let kid of kidsArray) {
    let checkbox = document.getElementById(kid.uid);
    if (checkbox.checked) {
      targetedKids.push(kid.uid);
    }
  }

  let targetedFriends = [];

  for (let friend of friendsArray) {
    let checkbox = document.getElementById(friend.uid);
    if (checkbox.checked) {
      targetedFriends.push(friend.uid);
    }
  }

  requestForm = new CareRequest(
    requestType.value,
    requestDetails.value,
    startDateTime,
    endDateTime,
    startLocation.value,
    endLocation.value,
    targetedKids,
    targetedFriends,
    signedInUserId, 
    Math.random()*100000000
  );

  console.log(requestForm);

  drawRequestForm(requestForm);
  navigateToPage("nextPage");
});

// Submit button
submitButton.addEventListener("click", (event) => {
  event.preventDefault();

  addCareRequest(requestForm);
});

// Back button
backButton.addEventListener("click", (event) => {
  event.preventDefault();
  navigateToPage("previousPage");
});

// Dashboard button - navigate to home.html
dashboardButton.addEventListener("click", () => {
  console.log(window.location.href);
  location = window.location.href.replace("/care", "/get-care");
});

// Navigate to page
function navigateToPage(destination) {
  const requestStart = document.querySelector("#request-start");
  const requestConfirm = document.querySelector("#request-confirm");
  const requestSuccess = document.querySelector("#request-success");

  if (destination === "nextPage") {
    requestStart.style.display = "none";
    requestConfirm.style.display = "block";
  }

  if (destination === "previousPage") {
    requestStart.style.display = "block";
    requestConfirm.style.display = "none";
    outputKidsDetails.innerHTML = '';
    outputFriendsDetails.innerHTML = '';
  }

  if (destination === "confirmation") {
    requestStart.style.display = "none";
    requestConfirm.style.display = "none";
    requestSuccess.style.display = "block";
  }
}

// Send care request to database
async function addCareRequest(requestForm) {

  if (signedInUserData.parentScore === 0) {
    alert ("You don't have enough credits to make a request!");
    return;
  }

  let convertedForm = requestForm.convertToObject(); // convert CareRequest class object to regular object
  try {
    const response = await addDoc(
      collection(firestore, "care_request"),
      convertedForm
    );
    console.log (convertedForm)
    
    for(let target_friend of convertedForm.targeted_friends) {
      console.log(target_friend);
      const notification = await addDoc(collection(firestore, "notifications", target_friend, "notifs"),{
        notification_body: `You have a new care request from ${signedInUserData.firstNameParent} ${signedInUserData.lastNameParent}!`,
        notification_header: `New Care Request`,
        notification_type: "care_request",
        notification_document: response.id,
        notification_timestamp: Timestamp.now(),
        notification_url: `/give-care#`,
        notification_flag: false
      });
      console.log(`Notification added to Database successfully for user ${target_friend}`,notification);
    }

    console.log(`Request added to Database successfully`, response);

    // add request to event calendar

    // >>> for current user
    const eventRef = doc(collection(firestore, `events/${signedInUserId}/evt`));
    const eventCreate = await setDoc(eventRef, {
      timestamp: Timestamp.now(),
      type :convertedForm.request_type,
      startLocation : convertedForm.start_location,
      description : convertedForm.request_desctiption,
      url : "/get-care#"
    });
    console.log(`Event: ${eventCreate}`);

    // >>> for targeted friend
    const eventRefTargetedFriend = doc(collection(firestore, `events/${convertedForm.targeted_friends}/evt`));
    const eventCreateTargetedFriend = await setDoc(eventRefTargetedFriend, {
      timestamp: Timestamp.now(), 
      type :convertedForm.request_type,
      startLocation : convertedForm.start_location,
      description : convertedForm.request_desctiption,
      url : "/give-care#"
    });
    console.log(`Event: ${eventCreateTargetedFriend}`);



    subtractParentScore();
    navigateToPage("confirmation");
  } catch (error) {
    console.log("There was an error!", error);
  }
}

async function subtractParentScore() {
  const updatedScore = {
    parentScore: signedInUserData.parentScore - 1
  };

  const userRef = doc(firestore, "users", signedInUserId);
  // update status
  await updateDoc(userRef, updatedScore);
}

// Clear form
// clearButton.addEventListener("click", (event) => {
//   event.preventDefault();
//   clearRequestForm();
// });

// Output request details below the form
function drawRequestForm(requestForm) {
  console.log(requestForm);

  outputRequestType.innerHTML = requestForm.request_type;

  // filter selected kids
  let targetedKidsArray = kidsArray.filter((kid) =>
    requestForm.targeted_kids.includes(kid.uid)
  );
  console.log(targetedKidsArray);

  targetedKidsArray.forEach((targetedKid) => {
    let paragraph = document.createElement("p");
    paragraph.innerHTML = `${targetedKid.kidFirstNameadded} ${targetedKid.kidLastNameadded}, ${targetedKid.kidAgeadded}<span> years</span>`;
    outputKidsDetails.append(paragraph);
  });

  outputRequestDetails.innerHTML = requestForm.request_desctiption;
  outputDate.innerHTML = requestForm.start_time.toLocaleDateString();
  outputStartTime.innerHTML = requestForm.start_time.toLocaleTimeString();
  outputEndTime.innerHTML = requestForm.end_time.toLocaleTimeString();
  outputStartLocation.innerHTML = requestForm.start_location;
  outputEndLocation.innerHTML = requestForm.end_location;

  // filter selected friends
  let targetedFriendsArray = friendsArray.filter((friend) =>
    requestForm.targeted_friends.includes(friend.uid)
  );
  console.log(targetedFriendsArray);

  targetedFriendsArray.forEach((targetedFriend) => {
    let paragraph = document.createElement("p");
    paragraph.innerHTML = `${targetedFriend.firstNameParent} ${targetedFriend.lastNameParent}`;
    outputFriendsDetails.append(paragraph);
  });
}

// function clearRequestForm() {
//     requestTitleCheckBox.value = '';
//     requestDetails.value = '';
//     date.value = '';
//     startTime.value = '';
//     endTime.value = '';
//     startLocation.value = '';
//     endLocation.value = '';
//     output.innerHTML = '';
//   }

class CareRequest {
  constructor(
    requestType,
    requestDetails,
    startTime,
    endTime,
    startLocation,
    endLocation,
    targetedKids,
    targetedFriends,
    askerUuid,
    requestID,
    status = "pending"
  ) {
    this.request_type = requestType;
    this.request_desctiption = requestDetails;
    this.start_time = startTime;
    this.end_time = endTime;
    this.start_location = startLocation;
    this.end_location = endLocation;
    this.targeted_kids = targetedKids; // changing to targeted_kids, because there can be more than one
    this.targeted_friends = targetedFriends;
    this.asker_UUID = askerUuid;
    this.requestID = requestID;
    this.status = status;
  }

  convertToObject() {
    const convertedObject = Object.assign({}, this);
    return convertedObject;
  }
}

// Load the Google Maps API script
function initMap() {
  const apiKey = "";
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=geocodeAddress`;
  document.body.appendChild(script);
}

// Define the geocodeAddress function
function geocodeAddress() {
  const addressInput = document.getElementById("start-location");
  const autocomplete = new google.maps.places.Autocomplete(addressInput);
  autocomplete.setFields(["geometry"]);

  // Listen for the place_changed event
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    // Use the latitude and longitude to download the location data
    downloadLocationData(lat, lng);
  });
}

// map auto complete

let apiKey = "";

// Create the script tag, set the appropriate attributes
let script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
script.async = true;
script.defer = true;

// Attach your callback function to the `window` object
window.initAutocomplete = function initAutocomplete() {
  const autoComplete1 = new google.maps.places.Autocomplete(
    document.getElementById("start-location"),
    {
      // types: ["establishment"],
      // types: ["school", "address"],
      componentRestrictions: { country: ["CA"] },
      // fields: ["place_id", "geometry", "name", "street_address"],
      fields: ["place_id", "geometry", "name"],
      // fields: ["place_id", "geometry", "name", "address_components"],
    }
  );
  const autoComplete2 = new google.maps.places.Autocomplete(
    document.getElementById("end-location"),
    {
      // types: ["establishment"],
      // types: ["school", "address"],
      componentRestrictions: { country: ["CA"] },
      // fields: ["place_id", "geometry", "name","street_address"],
      fields: ["place_id", "geometry", "name"],
      // fields: ["place_id", "geometry", "name", "address_components"],
    }
  );

  // autoComplete.addEventListener('place_changed',onPlaceChanged);
};

// Append the 'script' element to 'head'
document.head.appendChild(script);


// Define the downloadLocationData function
function downloadLocationData(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBwEb_-4wH7b5RPQ-Jy2xuzbaikswfhIUY`;

  // Use fetch to download the location data
  fetch(url)
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
}


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
