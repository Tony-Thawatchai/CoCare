import { displayRandomUsers } from "./firebase-disable.js";
// import and initialize **************
import { initialize } from "./firebase.js";


import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
  } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
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
    orderBy,
    onSnapshot,
  } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
  
  const { auth } = initialize();
  const { firestore } = initialize();

  // NAVIGATION=========
let btnLogout = document.getElementById("btnLogout");
btnLogout.addEventListener(`click`, () => {
  console.log("logout");
  logout();
  location.replace("/");
});
// add onAuthStateChanged
onAuthStateChanged(auth, async function (user) {
  if (user) {
    navLoginUser.classList.toggle("nav-login-user-active");
    navNonLoginUser.classList.toggle("nav-non-login-user-active");
    btnLogout.classList.toggle("btnLogout-acitve");
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
    activeUserDocId = key.id;
    userFirstNameParent = key.data().firstNameParent;
    userLastNameParent = key.data().lastNameParent;
    userprofileImgParent = key.data().profileImgParent;
  });

  if (user) {
    //   console.log(loggedUser);
    showAuthStateToOutput(userFirstNameParent, userParentScore);
    console.log(`auth.currentUser => ${userFirstNameParent}`);
    console.log(`userParentScore => ${userParentScore}`);
  } else {
    let notLoggedInMessage = ` you're not logged in.`;
    //   console.log(notLoggedInMessage);
    showAuthStateToOutput(notLoggedInMessage);
  }
}

function showAuthStateToOutput(userFirstNameParent, parentScore) {
  let createScoreImg = document.createElement("img");
  createScoreImg.setAttribute("src", "../icons/CoCoin.png");
  let createScoreText = document.createElement("p");
  createScoreText.innerHTML = parentScore;
//   scoreOutput.appendChild(createScoreText);
//   scoreOutput.appendChild(createScoreImg);

  welcomeUserName.innerHTML = userFirstNameParent;
  userProfilePicMenu.setAttribute("src", userprofileImgParent);
  userFirstNameMenu.innerHTML = userFirstNameParent;
  userLastNameMenu.innerHTML = userLastNameParent;
}

async function initializeParents() {
  const parents = await displayRandomUsers(12);
  console.log(parents);
  displayParents(parents);
}

function displayParents(parents) {
  const parentContainer = document.querySelector(".parents-parents-list");
  parentContainer.innerHTML = "";
  parents.forEach((parent) => {
    let item = "";
    item += `<li class="parents-parents-list-item">`;
    item += `<div class="parents-parents-list-item-pic">`;
    // Check profile picture if it exists if not put a picsum photos picture
    if (
      parent.profileImgParent === undefined ||
      parent.profileImgParent === null ||
      parent.profileImgParent === ""
    ) {
      item += `<img src="https://picsum.photos/200?random=555" alt="parent profile picture">`;
    } else {
      item += `<img src="${parent.profileImgParent}" alt="parent profile picture">`;
    }
    item += `</div>`;
    item += `<div class="parents-parents-list-item-content">`;
    item += `<a href="/profiles?u=${parent.uid}">`;
    item += `<h3>${parent.firstNameParent} ${parent.lastNameParent}</h3>`;
    item += `</a>`;
    item += `</div>`;
    item += `<button class="parents-parents-list-item-btn" id=${parent.uid}>Message Me</button>`;
    item += `</li>`;
    parentContainer.innerHTML += item;
  });
}

initializeParents();

//mobile menu
function mobileMenu() {
  desktopMenu.classList.toggle("mobile-menu-active");
}
hamburgerBtn.addEventListener("click", mobileMenu);
