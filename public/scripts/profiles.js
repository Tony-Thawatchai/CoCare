import {
  getFirebase,
  getUserProfile,
  verifyUserFriend,
  addFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  deleteFriend,
  updateNotificationAsRead,
} from "./firebase-disable.js";
const { auth } = getFirebase();

// Verify user is logged in and initialize "secondary menu"
auth.onAuthStateChanged(async (user) => {
  if (user) {
    navLoginUser.classList.toggle("nav-login-user-active");
    navNonLoginUser.classList.toggle("nav-non-login-user-active");
    secondaryMenu.classList.toggle("secondary-menu-active");
    userProfileMenu.classList.toggle("user-profile-active");
    menuItemHome.classList.toggle("menu-item-active");

    // Get User Profile
    const user_profile = await getUserProfile(user.uid);
    // Set user user details
    const profile_pic = document.querySelector("#userProfilePicMenu");
    profile_pic.src = user_profile.profileImgParent;
    const first_name = document.querySelector("#userFirstNameMenu");
    first_name.innerHTML = user_profile.firstNameParent;
    const last_name = document.querySelector("#userLastNameMenu");
    last_name.innerHTML = user_profile.lastNameParent;
    const header_name = document.querySelector("#welcomeUserName");
    header_name.innerHTML = user_profile.firstNameParent;
  } else {
    console.log(`User is not logged in`);
    window.location = "/";
  }
});

async function initializeProfiles() {
  try {
    const userParam = verifyProfilesParameters();
    const notifParam = verifyNotificationsParameters();
    const userProfile = await getUserProfile(userParam);
    if (userProfile === null || userProfile === undefined) {
      // User profile is null or undefined - redirect to home page - invalid user id
      console.log(`User profile is null or undefined`);
      window.location = "/";
    }

    if (notifParam !== null) {
      // Delete notification
      const isDeleted = await updateNotificationAsRead(notifParam);
      if (isDeleted) {
        console.log(`Notification deleted`);
      }
    }

    const isFriend = await verifyUserFriend(userParam);
    displayProfile(userProfile, isFriend);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

// Verify parameters provided in URL and redirect to home page if empty or invalid
function verifyProfilesParameters() {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("u");
  if (uid === null || uid === undefined || uid === "") {
    console.log(`No user id provided`);
    window.location = "/";
  }
  return uid;
}

function verifyNotificationsParameters() {
  const params = new URLSearchParams(window.location.search);
  const notif = params.get("n");
  if (notif === null || notif === undefined || notif === "") {
    console.log(`No notification provided`);
    return null;
  } else {
    const notifDoc = params.get("d");
    if (notifDoc === null || notifDoc === undefined || notifDoc === "") {
      console.log(`No notification document id provided`);
      return null;
    } else {
      return notifDoc;
    }
  }
}

function displayProfile(user, isFriend) {
  // Initialize user profile pic DOM element
  const profilePic = document.querySelector("#profile-main-pic-img");

  // Verify if user has a profile pic
  if (
    user.profileImgParent === undefined ||
    user.profileImgParent === null ||
    user.profileImgParent === ""
  ) {
    user.profileImgParent = "https://picsum.photos/200?random=555";
  }
  profilePic.src = user.profileImgParent;

  // Initialize user name DOM element
  const profileName = document.querySelector("#profile-main-name");
  profileName.innerHTML = user.firstNameParent + " " + user.lastNameParent;

  // Initialize user add/remove friend DOM element
  const profileFriendButton = document.querySelector("#profile_friend_button");
  if (isFriend === "friend") {
    profileFriendButton.innerHTML = `<i class="fa-solid fa-user-xmark"></i>`;
    profileFriendButton.innerHTML += "Remove Friend";
  }

  if (isFriend === "friendrequestpending") {
    profileFriendButton.innerHTML = `<i class="fa-solid fa-user-check"></i>`;
    profileFriendButton.innerHTML += "Accept Request";
  }

  if (isFriend === "notfriend") {
    profileFriendButton.innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
    profileFriendButton.innerHTML += "Add Friend";
  }

  if (isFriend === "friendrequest") {
    profileFriendButton.innerHTML = `<i class="fa-solid fa-user-check"></i>`;
    profileFriendButton.innerHTML += "Cancel Request";
  }

  console.log(user);
  console.log(isFriend);
}

// Initilize message button
const message_button = document.querySelector("#profile_message_button");
message_button.addEventListener("click", () => {
  window.location = "/messages?u=" + verifyProfilesParameters();
});

// Initilize friend button
const friend_button = document.querySelector("#profile_friend_button");
friend_button.addEventListener("click", () => {
  if (friend_button.textContent === "Add Friend") {
    console.log("Add friend");
    const isAdded = addFriendRequest(verifyProfilesParameters());
    if (isAdded) {
      friend_button.innerHTML = `<i class="fa-solid fa-user-check"></i>`;
      friend_button.innerHTML += "Cancel Request";
    }
    return;
  }

  if (friend_button.textContent === "Remove Friend") {
    console.log("Remove friend");
    const isDeleted = deleteFriend(verifyProfilesParameters());
    if (isDeleted) {
      friend_button.innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
      friend_button.innerHTML += "Add Friend";
    }
    return;
  }

  if (friend_button.textContent === "Accept Request") {
    console.log("Accept friend request");
    const isFriend = acceptFriendRequest(verifyProfilesParameters());
    if (isFriend) {
      friend_button.innerHTML = `<i class="fa-solid fa-user-xmark"></i>`;
      friend_button.innerHTML += "Remove Friend";
    }
    return;
  }

  if (friend_button.textContent === "Cancel Request") {
    console.log("Cancel friend request");
    const isDeleted = cancelFriendRequest(verifyProfilesParameters());
    if (isDeleted) {
      friend_button.innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
      friend_button.innerHTML += "Add Friend";
    }
    return;
  }
});

initializeProfiles();

//mobile menu
function mobileMenu() {
  desktopMenu.classList.toggle("mobile-menu-active");
}
hamburgerBtn.addEventListener("click", mobileMenu);
