// import and initialize **************
import { initialize } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
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
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadString,
  getStorage,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-storage.js";

const { storage } = initialize();

const { auth } = initialize();
const { firestore } = initialize();

// login ================

async function loginEmailPassword() {
  const loginEmail = txtEmail.value;
  const loginPassword = txtPassword.value;
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmail,
      loginPassword
    );
    location.replace("../HTML/home.html");
  } catch (error) {
    console.log(error);
  }
}

submitBtn.addEventListener("click", loginEmailPassword);

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
    // addUserToDatabase(userCredential.user);
    showDetailsForm();
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

function showDetailsForm() {
  backBtnSignUp.disabled = true;
  submitBtnSignUp.disabled = true;
  console.log(auth.currentUser.email);
  console.log(auth.currentUser.uid);
  kidDetails.classList.toggle("active-div");
  parentDetails.classList.toggle("active-div");
}
// camera for profile picutre================

const video = document.getElementById("video");

// Elements for taking the snapshot
const canvas = document.getElementById("canvas");
const retake = document.getElementById("retake");
const confirmBtn = document.getElementById("confirmBtn");
const capture = document.getElementById("capture");
const context = canvas.getContext("2d");
context.scale(0.5, 0.5);

const startBtn = document.getElementById("takePhoto");
videoArea.hidden = true;
// const stopBtn = document.getElementById('stop');

function startCamera() {
  console.log("startCamera is called");
  startBtn.innerHTML = "takePhoto";
  // uploadPhoto.hidden = true;
  videoArea.hidden = false;
  video.hidden = false;
  capture.hidden = false;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      // video.play();  // or autplay
      startBtn.disabled = true;
      canvas.hidden = true;
      confirmBtn.hidden = true;
      retake.hidden = true;
      // stopBtn.disabled = false;
    });
  } else {
    console.log("media devices not available in this browser");
  }
}
startBtn.addEventListener("click", startCamera);

// // Trigger photo take
capture.addEventListener("click", snapPhoto);

function snapPhoto() {
  console.log("snapPhoto is called");
  canvas.hidden = false;
  video.hidden = true;
  confirmBtn.hidden = false;
  retake.hidden = false;
  capture.hidden = true;

  context.drawImage(video, 0, 0);
}

retake.addEventListener("click", startCamera);

confirmBtn.addEventListener("click", confirmPhotoTaken);

let profilePicURL = null;

async function confirmPhotoTaken() {
  capture.hidden = true;
  retake.hidden = true;
  confirmBtn.hidden = true;
  startBtn.disabled = false;
  startBtn.innerHTML = "retake photo";
  const tracks = video.srcObject.getTracks();
  tracks.forEach((track) => track.stop());

  const canvasDataURL = canvas.toDataURL();
  console.log(canvasDataURL);
  // const imageBlob = canvas.toBlob(function (blob) {}, "image/jpeg");
  // console.log (imageBlob)

  const imageRef = ref(storage, `userProfilePic/${auth.currentUser.uid}`);

  // const uploadTask = uploadBytesResumable(imageRef, canvasDataURL);
  // const uploadTask = uploadString(imageRef,canvasDataURL, 'data_url')

  await uploadString(imageRef, canvasDataURL, "data_url")
    .then((snapshot) => {
      console.log("Uploaded a base64url string!");
      // profilePicURL=snapshot.metadata.fullPath;
      console.log(snapshot);
    })
    .catch(() => {
      console.log("upload error");
    });

  await getDownloadURL(imageRef).then((downloadURL) => {
    console.log("File available at", downloadURL);
    profilePicURL = downloadURL;
    console.log(profilePicURL);
  });
}

//upload photo ===============

let image;

fileInput.addEventListener("change", (e) => {
  image = e.target.files[0];
});

uploadPhoto.addEventListener("submit", (e) => {
  e.preventDefault();

  if (image == null) return;

  console.log(image);

  const imageRef = ref(storage, `userProfilePic/${auth.currentUser.uid}`);

  const uploadTask = uploadBytesResumable(imageRef, image);
  let uploadPercent = document.createElement("p");

  uploadPhoto.appendChild(uploadPercent);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );

      uploadPercent.innerHTML = `your upload is ongoing at ${progress}%`;
      if (progress == 100) {
        uploadPercent.innerHTML = `Completed!`;
        uploadPercent.style.color = "green";
        setTimeout(() => {
          uploadPhoto.removeChild(uploadPercent);
        }, 2000);
      }

      console.log(`Upload ${progress}%`);
    },
    (error) => {
      // Handle unsuccessful uploads
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log("File available at", downloadURL);
        let completeUploadedPic = document.createElement("img");
        completeUploadedPic.setAttribute("src", downloadURL);
        uploadPhoto.appendChild(completeUploadedPic);
        profilePicURL = downloadURL;
      });
    }
  );
});

// parent data>>input how many kid?>>draw number of form according to number of kid>> each submit create new object from kid class

//draw form>> amount of form equal amont of kid
let arrayOfKidObject = [];
kidAmountBth.addEventListener("click", showKidDetailsForm);
// *add feature for user to go back and change number of kids
function showKidDetailsForm() {
  let amontOfForm = Number(kidAmount.value);
  let kidOrder = 1;
  addKidForm();
  //add kid details form
  // for (let i = 0; i < amontOfForm; i++) {
  //   let formHeadline = document.createElement("p");
  //   formHeadline.innerHTML = `Kid #${i + 1}`;

  //   kidDetails.appendChild(formHeadline);

  //   let labelkidFirstName = document.createElement("label");
  //   labelkidFirstName.setAttribute(`for`, `labelkidFirstName${i + 1}`);
  //   labelkidFirstName.innerHTML = `kidFirstName`;

  //   let inputkidFirstName = document.createElement("input");
  //   inputkidFirstName.setAttribute(`type`, `text`);
  //   inputkidFirstName.setAttribute(`name`, `labelkidFirstName`);
  //   inputkidFirstName.setAttribute(`id`, `labelkidFirstName${i + 1}`);

  //   kidDetails.appendChild(labelkidFirstName);
  //   kidDetails.appendChild(inputkidFirstName);

  //   let labelKidLastName = document.createElement("label");
  //   labelKidLastName.setAttribute(`for`, `labelKidLastName${i + 1}`);
  //   labelKidLastName.innerHTML = `KidLastName`;

  //   let inputKidLastName = document.createElement("input");
  //   inputKidLastName.setAttribute(`type`, `text`);
  //   inputKidLastName.setAttribute(`name`, `labelKidLastName`);
  //   inputKidLastName.setAttribute(`id`, `labelKidLastName${i + 1}`);

  //   kidDetails.appendChild(labelKidLastName);
  //   kidDetails.appendChild(inputKidLastName);

  //   let labelkidAge = document.createElement("label");
  //   labelkidAge.setAttribute(`for`, `labelkidAge${i + 1}`);
  //   labelkidAge.innerHTML = `kidAge`;

  //   let inputkidAge = document.createElement("input");
  //   inputkidAge.setAttribute(`type`, `number`);
  //   inputkidAge.setAttribute(`name`, `labelkidAge`);
  //   inputkidAge.setAttribute(`id`, `labelkidAge${i + 1}`);

  //   kidDetails.appendChild(labelkidAge);
  //   kidDetails.appendChild(inputkidAge);

  //   let divAllergy = document.createElement("div");
  //   divAllergy.setAttribute(`id`, `allergyContainer`);
  //   divAllergy.innerHTML = `Please your kid allergy:<br>`;
  //   kidDetails.appendChild(divAllergy);

  //   let labelmilk = document.createElement("label");
  //   labelmilk.setAttribute(`for`, `labelmilk${i + 1}`);
  //   labelmilk.innerHTML = `milk`;

  //   let inputmilk = document.createElement("input");
  //   inputmilk.setAttribute(`type`, `checkbox`);
  //   inputmilk.setAttribute(`name`, `labelmilk`);
  //   inputmilk.setAttribute(`value`, `milk`);
  //   inputmilk.setAttribute(`id`, `labelmilk${i + 1}`);

  //   divAllergy.appendChild(inputmilk);
  //   divAllergy.appendChild(labelmilk);

  //   let labelEgg = document.createElement("label");
  //   labelEgg.setAttribute(`for`, `labelEgg${i + 1}`);
  //   labelEgg.innerHTML = `Egg`;

  //   let inputEgg = document.createElement("input");
  //   inputEgg.setAttribute(`type`, `checkbox`);
  //   inputEgg.setAttribute(`name`, `labelEgg`);
  //   inputEgg.setAttribute(`value`, `Egg`);
  //   inputEgg.setAttribute(`id`, `labelEgg${i + 1}`);

  //   divAllergy.appendChild(inputEgg);
  //   divAllergy.appendChild(labelEgg);

  //   let labelPeanut = document.createElement("label");
  //   labelPeanut.setAttribute(`for`, `labelPeanut${i + 1}`);
  //   labelPeanut.innerHTML = `Peanut`;

  //   let inputPeanut = document.createElement("input");
  //   inputPeanut.setAttribute(`type`, `checkbox`);
  //   inputPeanut.setAttribute(`name`, `labelPeanut`);
  //   inputPeanut.setAttribute(`value`, `Peanut`);
  //   inputPeanut.setAttribute(`id`, `labelPeanut${i + 1}`);

  //   divAllergy.appendChild(inputPeanut);
  //   divAllergy.appendChild(labelPeanut);

  //   let labelGluten = document.createElement("label");
  //   labelGluten.setAttribute(`for`, `labelGluten${i + 1}`);
  //   labelGluten.innerHTML = `Gluten`;

  //   let inputGluten = document.createElement("input");
  //   inputGluten.setAttribute(`type`, `checkbox`);
  //   inputGluten.setAttribute(`name`, `labelGluten`);
  //   inputGluten.setAttribute(`value`, `Gluten`);
  //   inputGluten.setAttribute(`id`, `labelGluten${i + 1}`);

  //   divAllergy.appendChild(inputGluten);
  //   divAllergy.appendChild(labelGluten);

  //   let labelOtherAllergy = document.createElement("label");
  //   labelOtherAllergy.setAttribute(`for`, `labelOtherAllergy${i + 1}`);
  //   labelOtherAllergy.innerHTML = `<br>OtherAllergy`;

  //   let inputOtherAllergy = document.createElement("input");
  //   inputOtherAllergy.setAttribute(`type`, `text`);
  //   inputOtherAllergy.setAttribute(`name`, `labelOtherAllergy`);
  //   inputOtherAllergy.setAttribute(`id`, `labelOtherAllergy${i + 1}`);

  //   divAllergy.appendChild(labelOtherAllergy);
  //   divAllergy.appendChild(inputOtherAllergy);

  //   let labelSchool = document.createElement("label");
  //   labelSchool.setAttribute(`for`, `labelSchool${i + 1}`);
  //   labelSchool.innerHTML = `School`;

  //   let inputSchool = document.createElement("input");
  //   inputSchool.setAttribute(`type`, `text`);
  //   inputSchool.setAttribute(`name`, `labelSchool`);
  //   inputSchool.setAttribute(`id`, `labelSchool${i + 1}`);

  //   //*put in school name and call map API for address,geolocation=======

  //   kidDetails.appendChild(labelSchool);
  //   kidDetails.appendChild(inputSchool);

  //   let labelSpecialNote = document.createElement("label");
  //   labelSpecialNote.setAttribute(`for`, `labelSpecialNote${i + 1}`);
  //   labelSpecialNote.innerHTML = `Special note:`;

  //   let inputSpecialNote = document.createElement("input");
  //   inputSpecialNote.setAttribute(`type`, `text`);
  //   inputSpecialNote.setAttribute(`name`, `labelSpecialNote`);
  //   inputSpecialNote.setAttribute(`id`, `labelSpecialNote${i + 1}`);

  //   kidDetails.appendChild(labelSpecialNote);
  //   kidDetails.appendChild(inputSpecialNote);

  //   //*put in image API

  //   let labelProfileImgKid = document.createElement("label");
  //   labelProfileImgKid.setAttribute(`for`, `labelSpecialNote${i + 1}`);
  //   labelProfileImgKid.innerHTML = `ProfileImgKid:`;

  //   let inputProfileImgKid = document.createElement("input");
  //   inputProfileImgKid.setAttribute(`type`, `text`);
  //   inputProfileImgKid.setAttribute(`name`, `labelSpecialNote`);
  //   inputProfileImgKid.setAttribute(`id`, `labelSpecialNote${i + 1}`);

  //   kidDetails.appendChild(labelProfileImgKid);
  //   kidDetails.appendChild(inputProfileImgKid);

  //   let confirmKidDetailsBtn = document.createElement("button");
  //   confirmKidDetailsBtn.setAttribute(`type`, `button`);
  //   confirmKidDetailsBtn.setAttribute(`id`, `confirmKidDetailsBtn${i + 1}`);
  //   confirmKidDetailsBtn.setAttribute(`onclick`, `createKidObject(${i + 1})`);
  //   confirmKidDetailsBtn.innerHTML = `confirm kid#${i + 1} details`;

  //   kidDetails.appendChild(confirmKidDetailsBtn);

  // *try const Btn1 = document.getElementById(`confirmKidDetailsBtn${i+1}`);
  // *try dynamic variable name (https://www.geeksforgeeks.org/how-to-use-dynamic-variable-names-in-javascript/)
  // var k = 'value';
  // var i = 0;
  // for(i = 1; i < 5; i++) {
  //     eval('var ' + k + i + '= ' + i + ';');
  // }
  // console.log("value1=" + value1);
  // console.log("value2=" + value2);
  // console.log("value3=" + value3);
  // console.log("value4=" + value4);
  // }

  function addKidForm() {
    if (kidOrder <= amontOfForm) {
      let formHeadline = document.createElement("p");
      formHeadline.innerHTML = `Kid #${kidOrder}`;

      KidForm.appendChild(formHeadline);

      let labelkidFirstName = document.createElement("label");
      labelkidFirstName.setAttribute(`for`, `labelkidFirstName`);
      labelkidFirstName.innerHTML = `kidFirstName`;

      let inputkidFirstName = document.createElement("input");
      inputkidFirstName.setAttribute(`type`, `text`);
      inputkidFirstName.setAttribute(`name`, `labelkidFirstName`);
      inputkidFirstName.setAttribute(`id`, `labelkidFirstName`);

      KidForm.appendChild(labelkidFirstName);
      KidForm.appendChild(inputkidFirstName);

      let labelKidLastName = document.createElement("label");
      labelKidLastName.setAttribute(`for`, `labelKidLastName`);
      labelKidLastName.innerHTML = `KidLastName`;

      let inputKidLastName = document.createElement("input");
      inputKidLastName.setAttribute(`type`, `text`);
      inputKidLastName.setAttribute(`name`, `labelKidLastName`);
      inputKidLastName.setAttribute(`id`, `labelKidLastName`);

      KidForm.appendChild(labelKidLastName);
      KidForm.appendChild(inputKidLastName);

      let labelkidAge = document.createElement("label");
      labelkidAge.setAttribute(`for`, `labelkidAge`);
      labelkidAge.innerHTML = `kidAge`;

      let inputkidAge = document.createElement("input");
      inputkidAge.setAttribute(`type`, `number`);
      inputkidAge.setAttribute(`name`, `labelkidAge`);
      inputkidAge.setAttribute(`id`, `labelkidAge`);

      KidForm.appendChild(labelkidAge);
      KidForm.appendChild(inputkidAge);

      let divAllergy = document.createElement("div");
      divAllergy.setAttribute(`id`, `allergyContainer`);
      divAllergy.innerHTML = `Please your kid allergy:<br>`;
      KidForm.appendChild(divAllergy);

      let labelmilk = document.createElement("label");
      labelmilk.setAttribute(`for`, `labelMilk`);
      labelmilk.innerHTML = `milk`;

      let inputmilk = document.createElement("input");
      inputmilk.setAttribute(`type`, `checkbox`);
      inputmilk.setAttribute(`name`, `labelMilk`);
      inputmilk.setAttribute(`value`, `milk`);
      inputmilk.setAttribute(`id`, `labelMilk`);

      divAllergy.appendChild(inputmilk);
      divAllergy.appendChild(labelmilk);

      let labelEgg = document.createElement("label");
      labelEgg.setAttribute(`for`, `labelEgg`);
      labelEgg.innerHTML = `Egg`;

      let inputEgg = document.createElement("input");
      inputEgg.setAttribute(`type`, `checkbox`);
      inputEgg.setAttribute(`name`, `labelEgg`);
      inputEgg.setAttribute(`value`, `Egg`);
      inputEgg.setAttribute(`id`, `labelEgg`);

      divAllergy.appendChild(inputEgg);
      divAllergy.appendChild(labelEgg);

      let labelPeanut = document.createElement("label");
      labelPeanut.setAttribute(`for`, `labelPeanut`);
      labelPeanut.innerHTML = `Peanut`;

      let inputPeanut = document.createElement("input");
      inputPeanut.setAttribute(`type`, `checkbox`);
      inputPeanut.setAttribute(`name`, `labelPeanut`);
      inputPeanut.setAttribute(`value`, `Peanut`);
      inputPeanut.setAttribute(`id`, `labelPeanut`);

      divAllergy.appendChild(inputPeanut);
      divAllergy.appendChild(labelPeanut);

      let labelGluten = document.createElement("label");
      labelGluten.setAttribute(`for`, `labelGluten`);
      labelGluten.innerHTML = `Gluten`;

      let inputGluten = document.createElement("input");
      inputGluten.setAttribute(`type`, `checkbox`);
      inputGluten.setAttribute(`name`, `labelGluten`);
      inputGluten.setAttribute(`value`, `Gluten`);
      inputGluten.setAttribute(`id`, `labelGluten`);

      divAllergy.appendChild(inputGluten);
      divAllergy.appendChild(labelGluten);

      let labelOtherAllergy = document.createElement("label");
      labelOtherAllergy.setAttribute(`for`, `labelOtherAllergy`);
      labelOtherAllergy.innerHTML = `<br>OtherAllergy`;

      let inputOtherAllergy = document.createElement("input");
      inputOtherAllergy.setAttribute(`type`, `text`);
      inputOtherAllergy.setAttribute(`name`, `labelOtherAllergy`);
      inputOtherAllergy.setAttribute(`id`, `labelOtherAllergy`);

      divAllergy.appendChild(labelOtherAllergy);
      divAllergy.appendChild(inputOtherAllergy);

      let labelSchool = document.createElement("label");
      labelSchool.setAttribute(`for`, `labelSchool`);
      labelSchool.innerHTML = `School`;

      let inputSchool = document.createElement("input");
      inputSchool.setAttribute(`type`, `text`);
      inputSchool.setAttribute(`name`, `labelSchool`);
      inputSchool.setAttribute(`id`, `labelSchool`);

      //*put in school name and call map API for address,geolocation=======

      KidForm.appendChild(labelSchool);
      KidForm.appendChild(inputSchool);

      let labelSpecialNote = document.createElement("label");
      labelSpecialNote.setAttribute(`for`, `labelSpecialNote`);
      labelSpecialNote.innerHTML = `Special note:`;

      let inputSpecialNote = document.createElement("input");
      inputSpecialNote.setAttribute(`type`, `text`);
      inputSpecialNote.setAttribute(`name`, `labelSpecialNote`);
      inputSpecialNote.setAttribute(`id`, `labelSpecialNote`);

      KidForm.appendChild(labelSpecialNote);
      KidForm.appendChild(inputSpecialNote);

      //*put in image API

      let labelProfileImgKid = document.createElement("label");
      labelProfileImgKid.setAttribute(`for`, `labelProfileImgKid`);
      labelProfileImgKid.innerHTML = `ProfileImgKid:`;

      let inputProfileImgKid = document.createElement("input");
      inputProfileImgKid.setAttribute(`type`, `text`);
      inputProfileImgKid.setAttribute(`name`, `labelProfileImgKid`);
      inputProfileImgKid.setAttribute(`id`, `labelProfileImgKid`);

      KidForm.appendChild(labelProfileImgKid);
      KidForm.appendChild(inputProfileImgKid);

      let confirmKidDetailsBtn = document.createElement("button");
      confirmKidDetailsBtn.setAttribute(`type`, `button`);
      confirmKidDetailsBtn.setAttribute(`id`, `confirmKidDetailsBtn`);
      // confirmKidDetailsBtn.setAttribute(`onclick`, `createKidObject()`);
      confirmKidDetailsBtn.innerHTML = `confirm kid#${kidOrder} details`;

      KidForm.appendChild(confirmKidDetailsBtn);

      kidOrder++;
      confirmKidDetailsBtn.addEventListener("click", addNextKid);
    } else {
      //activate register button
      console.log("else");
    }
  }

  //add next kid>>remove confirmKidDetailsBtn from previous kid's form>>create previous kid object>>draw form for next kid

  function addNextKid() {
    while (kidAddedDetails.firstChild) {
      kidAddedDetails.removeChild(kidAddedDetails.firstChild);
    }

    // put all allergy to array>>ready to put in object
    let allergyArr = [];
    const milkadded = labelMilk.checked;
    const eggadded = labelEgg.checked;
    const glutenadded = labelGluten.checked;
    const peanutadded = labelPeanut.checked;
    const otherAllergyBoxadded = labelOtherAllergy.value;

    if (milkadded) {
      allergyArr.push(labelMilk.value);
    }
    if (eggadded) {
      allergyArr.push(labelEgg.value);
    }
    if (glutenadded) {
      allergyArr.push(labelGluten.value);
    }
    if (peanutadded) {
      allergyArr.push(labelPeanut.value);
    }
    if (otherAllergyBoxadded !== "") {
      allergyArr.push(otherAllergyBoxadded);
    }
    //bug = now other allergy still push even it is none

    const kid = new kidObject(
      labelkidFirstName.value,
      labelKidLastName.value,
      labelkidAge.value,
      allergyArr,
      labelSchool.value,
      labelSpecialNote.value,
      labelProfileImgKid.value
    );
    kid.pushToArrayOfKidObject(kid);

    // display previous object with edit button
    let kidOrder2 = 1;
    for (let item of arrayOfKidObject) {
      let addedKid = document.createElement("div");
      addedKid.innerHTML = `Kid#${kidOrder2}`;
      addedKid.innerHTML += `<br>${item.kidFirstNameadded}`;
      addedKid.innerHTML += `<br>${item.kidLastNameadded}`;
      addedKid.innerHTML += `<br>${item.kidAgeadded}`;
      addedKid.innerHTML += `<br>${item.allergy}`;
      addedKid.innerHTML += `<br>${item.schooladded}`;
      addedKid.innerHTML += `<br>${item.specialNoteadded}`;
      addedKid.innerHTML += `<br>${item.profileImgKidadded}`;
      kidOrder2++;
      kidAddedDetails.appendChild(addedKid);
    }
    // ** add edit button

    // remove previous form

    while (KidForm.firstChild) {
      KidForm.removeChild(KidForm.firstChild);
    }

    addKidForm();
    // console.log(arrayOfKidObject);
  }
}

class kidObject {
  constructor(
    kidFirstNameadded,
    kidLastNameadded,
    kidAgeadded,
    allergy,
    schooladded,
    specialNoteadded,
    profileImgKidadded
  ) {
    this.kidFirstNameadded = kidFirstNameadded;
    this.kidLastNameadded = kidLastNameadded;
    this.kidAgeadded = kidAgeadded;
    this.allergy = allergy;
    this.schooladded = schooladded;
    this.specialNoteadded = specialNoteadded;
    this.profileImgKidadded = profileImgKidadded;
  }

  pushToArrayOfKidObject() {
    arrayOfKidObject.push(this);
  }
}

async function addUserToDatabase() {
  try {
    const emailNewUser = auth.currentUser.email;
    const uidNewUser = auth.currentUser.uid;
    const firstNameParent = firstName.value;
    const lastNameParent = lastName.value;
    const profileImgParent = profilePicURL;

    // ***sync photo uploaded to storage with same document name as UID to user database

    // create document in database
    await setDoc(doc(firestore, `users/${uidNewUser}`), {
      email: emailNewUser,
      uid: uidNewUser,
      firstNameParent: firstNameParent,
      lastNameParent: lastNameParent,
      profileImgParent: profileImgParent,
      parentScore: 5,
    });

    // write kid document to subcollection

    const targetSubCollection = collection(
      firestore,
      `users/${uidNewUser}/kids`
    );
    console.log(arrayOfKidObject);
    for (let item of arrayOfKidObject) {
      let a = JSON.parse(JSON.stringify(item));
      let result = await addDoc(targetSubCollection, a);
    }

    console.log(`add to Database successfully`);
    location.replace("../HTML/home.html");
  } catch (error) {
    console.log(error);
  }
}

submitBtnSignUp.addEventListener("click", createAccount);
submitBtnSignUp2.addEventListener("click", addUserToDatabase);

// navigation ==========

submitBtn.addEventListener(`click`, () => {
  signIn.classList.toggle("active-div");
  loggedIn.classList.toggle("active-div");
});

linkToSignUp.addEventListener(`click`, () => {
  EmailSignUp.classList.toggle("active-div");
  signIn.classList.toggle("active-div");
  signUp.classList.toggle("active-div");
});

backBtnSignUp.addEventListener(`click`, () => {
  signIn.classList.toggle("active-div");
  signUp.classList.toggle("active-div");
});

backBtnSignUp2.addEventListener(`click`, () => {
  signIn.classList.toggle("active-div");
  signUp.classList.toggle("active-div");
});

// submitBtnSignUp.addEventListener(`click`, () => {
//   kidDetails.classList.toggle("active-div");
//   parentDetails.classList.toggle("active-div");
// });
submitBtnSignUp2.addEventListener(`click`, () => {
  signUp.classList.toggle("active-div");
  loggedIn.classList.toggle("active-div");
});

selectPhoto.addEventListener(`click`, () => {
  uploadPhoto.classList.toggle("active-div");
  selectPhoto.disabled=true;
  videoArea.hidden = true;
  startBtn.disabled = false;
});

// map auto complete

// async function initMap() {
//   const apiKey = 'AIzaSyDNNpgqIXvu6Atdkpfgddrukax9-aV0Fcc';
//   const script = document.createElement('script');
//   script.setAttribute('src',`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`) ;

//   // script.setAttribute('defer')
//   document.body.appendChild(script);

//   // const test = document.createElement('link');
//   // // script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=geocodeAddress`;
//   // // test.src = `test.css`;
//   // test.setAttribute('src','test.css')
//   // document.head.appendChild(test);
// }

// initMap()

let apiKey = "AIzaSyDNNpgqIXvu6Atdkpfgddrukax9-aV0Fcc";

// Create the script tag, set the appropriate attributes
let script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
script.async = true;
script.defer = true;

// Attach your callback function to the `window` object
window.initAutocomplete = function initAutocomplete() {
  const autoComplete = new google.maps.places.Autocomplete(
    document.getElementById("schoolOfKid"),
    {
      types: ["school"],
      componentRestrictions: { country: ["CA"] },
      fields: ["place_id", "geometry", "name"],
    }
  );

  // autoComplete.addEventListener('place_changed',onPlaceChanged);
};

// Append the 'script' element to 'head'
document.head.appendChild(script);

// function initAutocomplete() {
//   console.log('initAutocomplete is called')
//   autoComplete = new google.maps.places.Autocomplete(
//     document.getElementById('schoolOfKid'),
//     {
//       types: ['establishment'],
//       componentRestrictions: { country: ['CA'] },
//       fields: ['place_id', 'geometry', 'name']
//     }
//   );

//   // autoComplete.addEventListener('place_changed',onPlaceChanged);
// }

// function onPlaceChanged(){
//   let place = autoComplete.getPlace();

//   if (!place.geometry){
//     document.getElementById('schoolOfKid').placeholder = 'Enter a school name';
//   } else {
//     document.getElementById('details').innerHTML=place.name;
//   }

// }
