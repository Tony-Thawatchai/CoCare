// import and initialize **************
import { initialize } from "./firebase.js";
import {
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const { auth } = initialize();

// login ================

async function loginEmailPassword() {
  
  const loginEmail = txtEmail.value;
  const loginPassword = txtPassword.value;
  console.log('logging in', loginEmail, loginPassword, auth)
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmail,
      loginPassword
    );
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}

submitBtn.addEventListener("click", loginEmailPassword);

backBtn.addEventListener("click", ()=>{location.replace("/")});

// import { signIn } from "./firebase.js";

// const login_form = document.querySelector('#signin');
// login_form.addEventListener('submit', (evt) => {
//     evt.preventDefault();
//     // const loginEmail = 'testadmin@cocare.com';
//     // const loginPassword = 'testadmin';

//     const loginEmail = document.querySelector('#username').value;
//     const loginPassword = document.querySelector('#password').value;

    
//     try {
//         // Login using provided credentials
//         (async () => {
//             const login_cb = await signIn(loginEmail, loginPassword);
//             // When successful create a user and use the callback user as reference.
//             const user = login_cb.user;
//             window.location.href = "/";
//             // user successful login;
//         })();
//     } catch(err) {
//         // Unsuccessful login create a notif to the user
//         console.log('Something error while trying to login...');
//         console.log(err);
//     }
// });




function mobileMenu(){
  desktopMenu.classList.toggle('mobile-menu-active')
}
hamburgerBtn.addEventListener('click',mobileMenu)


            
          
            