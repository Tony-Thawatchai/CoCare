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
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadString,
  getStorage,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

const { storage } = initialize();

const { auth } = initialize();
const { firestore } = initialize();

// create account=================

async function createAccount() {
  const loginEmailSignUp = txtEmailSignUp.value;
  const loginPasswordSignUp = txtPasswordSignUp.value;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      loginEmailSignUp,
      loginPasswordSignUp
    );
    window.location.href = "/signup2";
    // addUserToDatabase(userCredential.user);
    
  } catch (error) {
    let errorMessage = document.createElement("p");
    errorMessage.innerHTML = error;
    signUp.appendChild(errorMessage);
    setTimeout(() => {
      signUp.removeChild(errorMessage);
    }, 2000);

    console.log(error);
  }
  // this medthod allow user to login right away with just username and password. The better way is to have email link, sign in with google to enhance security
}

submitBtnSignUp.addEventListener("click", createAccount);

// LOGOUT========
async function logout() {
  await signOut(auth);
  window.location.href = "/";
  //   clearAuthStateToOutput();
}
// navigation ==========

backBtnSignUp.addEventListener(`click`, () => {
  logout();
  // signIn.classList.toggle("active-div");
  // signUp.classList.toggle("active-div");
});

// backBtnSignUp2.addEventListener(`click`, () => {
//   signIn.classList.toggle("active-div");
//   signUp.classList.toggle("active-div");
// });

// submitBtnSignUp2.addEventListener(`click`, () => {
//   signUp.classList.toggle("active-div");
//   loggedIn.classList.toggle("active-div");
// });

// selectPhoto.addEventListener(`click`, () => {
//   uploadPhoto.classList.toggle("active-div");
//   selectPhoto.disabled = true;
//   videoArea.hidden = true;
//   startBtn.disabled = false;
// });


function mobileMenu(){
  desktopMenu.classList.toggle('mobile-menu-active')
}
hamburgerBtn.addEventListener('click',mobileMenu)
