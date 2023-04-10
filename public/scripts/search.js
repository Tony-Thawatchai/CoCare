// ========import firebase========
import { initialize } from "./firebase.js";
// import { getFirebase } from "./firebase-disable.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import {
  collection,
  addDoc,
  updateDoc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  limit,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const { auth } = initialize();
const { firestore } = initialize();

//=======import variable======

// import { goToSearchPage as goToSearchPage} from "./dashboard.js";


// Get the user ID from the URL query string
const params = new URLSearchParams(window.location.search);
const queryTerm = params.get('q');
// let userProfile = null;

console.log(queryTerm)
// ========check auth========

onAuthStateChanged(auth, async function (user) {
  if (user) {
    navLoginUser.classList.toggle("nav-login-user-active");
    navNonLoginUser.classList.toggle("nav-non-login-user-active");
    secondaryMenu.classList.toggle("secondary-menu-active");
    userProfileMenu.classList.toggle("user-profile-active");
    menuItemHome.classList.toggle("menu-item-active");

    monitorAuthState();
  }
});

// show which user is logged in and thier score
let activeUserDocId;
console.log("activeUserDocId");
console.log(activeUserDocId);
let userParentScore;
let userFirstNameParent = null;
let userLastNameParent = null;
let userprofileImgParent = null;
let userAuthorized = null;

async function monitorAuthState() {
  const user = auth.currentUser;
  console.log(`auth.currentUser`);
  console.log(user);

  const activeUserQuery = await query(
    collection(firestore, "users"),
    where("email", "==", user.email),
    limit(1)
  );

  const querySnapshot = await getDocs(activeUserQuery);

  const docURL = await querySnapshot.forEach((key) => {
    userParentScore = key.data().parentScore;
    console.log(userParentScore);
    activeUserDocId = key.id;
    console.log(activeUserDocId);
    userFirstNameParent = key.data().firstNameParent;
    userLastNameParent = key.data().lastNameParent;
    userprofileImgParent = key.data().profileImgParent;
  });

  if (user) {
    //   console.log(loggedUser);
    showAuthStateToOutput(userFirstNameParent, userParentScore);
    console.log(`auth.currentUser => ${userFirstNameParent}`);
    console.log(`userParentScore => ${userParentScore}`);
    welcomeUserName.innerHTML = userFirstNameParent;
    // getKidData();
    // showFriendList();
  } else {
    let notLoggedInMessage = ` you're not logged in.`;
    //   console.log(notLoggedInMessage);
    showAuthStateToOutput(notLoggedInMessage);
  }
}

function showAuthStateToOutput(userFirstNameParent, parentScore) {
  let createScoreParagraph = document.createElement("p");
  createScoreParagraph.innerHTML = `Parent score <i class="fa-solid fa-coins"></i> `;
  createScoreParagraph.innerHTML += parentScore;
  //   let createProfilePic = document.createElement("img");
  //   userProfilePicProfile.setAttribute("src", userprofileImgParent);
  //   userFirstNameProfile.innerHTML = userFirstNameParent;
  //   userLastNameProfile.innerHTML = userLastNameParent;
  userProfilePicMenu.setAttribute("src", userprofileImgParent);
  userFirstNameMenu.innerHTML = userFirstNameParent;
  userLastNameMenu.innerHTML = userLastNameParent;

  //   output.appendChild(createUserParagraph);
  //   output.appendChild(createScoreParagraph);
  //   output.appendChild(createProfilePic);
}

// ======query database==========

// goToSearchPage()
// console.log(searchInquiry)

// console.log (`without import`)