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

onAuthStateChanged(auth, async function (user) {
  if (user) {
    showDetailsForm();
    console.log("user logged in");
  }
});

let addedSchool;

function showDetailsForm() {
  // backBtnSignUp.disabled = false;
  //   submitBtnSignUp.disabled = true;
  let removeItems = document.getElementById("userInput");

  EmailSignUp.removeChild(removeItems);

  // ** if user go back they cannot use the same email to login again since it will already create new account
  let loginEmail = document.createElement("p");
  loginEmail.innerHTML = auth.currentUser.email;
  EmailSignUp.insertBefore(loginEmail, EmailSignUp.firstChild);

  console.log(auth.currentUser.email);
  console.log(auth.currentUser.uid);
  //   kidDetails.classList.toggle("active-div");
  //   parentDetails.classList.toggle("active-div");
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
  while (uploadPhotoConfirm.firstChild) {
    uploadPhotoConfirm.removeChild(uploadPhotoConfirm.firstChild);
  }
  startBtn.innerHTML = `<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>Take Photo`;
  // uploadPhoto.hidden = true;
  uploadPhoto.classList.remove("active-div");
  uploadPhotoConfirm.hidden = true;
  videoArea.hidden = false;
  cancel.hidden = false;
  selectPhoto.disabled = false;

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
  selectPhoto.disabled = false;
  cancel.hidden = true;
  confirmBtn.hidden = true;
  startBtn.disabled = false;
  startBtn.innerHTML = `<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>retake photo`;
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

function stopCamera() {
  selectPhoto.disabled = false;
  const tracks = video.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  startBtn.disabled = false;
  videoArea.hidden = true;
}

cancel.addEventListener("click", stopCamera);

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
        uploadPhotoConfirm.hidden = false;
        while (uploadPhotoConfirm.firstChild) {
          uploadPhotoConfirm.removeChild(uploadPhotoConfirm.firstChild);
        }
        let completeUploadedPic = document.createElement("img");
        completeUploadedPic.setAttribute("src", downloadURL);

        uploadPhotoConfirm.appendChild(completeUploadedPic);
        profilePicURL = downloadURL;
      });
    }
  );
});

selectPhoto.addEventListener(`click`, () => {
  uploadPhoto.classList.toggle("active-div");
  selectPhoto.disabled = true;
  videoArea.hidden = true;
  startBtn.disabled = false;
});

// camera for kid picutre================

const videoKid = document.getElementById("videoKid");

// Elements for taking the snapshot
const canvasKid = document.getElementById("canvasKid");
const retakeKid = document.getElementById("retakeKid");
const confirmBtnKid = document.getElementById("confirmBtnKid");
const captureKid = document.getElementById("captureKid");
const contextKid = canvasKid.getContext("2d");
contextKid.scale(0.5, 0.5);

const takePhotoKid = document.getElementById("takePhotoKid");
videoAreaKid.hidden = true;
// const stopBtn = document.getElementById('stop');
let profilePicURLKid = null;

function startCameraKid() {
  console.log("startCamera is called");
  while (uploadPhotoConfirmKid.firstChild) {
    uploadPhotoConfirmKid.removeChild(uploadPhotoConfirmKid.firstChild);
  }
  console.log("test");
  takePhotoKid.innerHTML = `<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>Take Photo`;
  // uploadPhoto.hidden = true;
  uploadPhotoKid.classList.remove("active-div");
  uploadPhotoConfirmKid.hidden = true;
  videoAreaKid.hidden = false;
  cancelKid.hidden = false;
  selectPhotoKid.disabled = false;

  videoKid.hidden = false;
  captureKid.hidden = false;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoKid.srcObject = stream;
      // video.play();  // or autplay
      takePhotoKid.disabled = true;
      canvasKid.hidden = true;
      confirmBtnKid.hidden = true;
      retakeKid.hidden = true;
      // stopBtn.disabled = false;
    });
  } else {
    console.log("media devices not available in this browser");
  }
}
takePhotoKid.addEventListener("click", startCameraKid);

// // Trigger photo take
captureKid.addEventListener("click", snapPhotoKid);

function snapPhotoKid() {
  console.log("snapPhoto is called");
  canvasKid.hidden = false;
  videoKid.hidden = true;
  confirmBtnKid.hidden = false;
  retakeKid.hidden = false;
  captureKid.hidden = true;

  contextKid.drawImage(videoKid, 0, 0);
}

retakeKid.addEventListener("click", startCameraKid);

confirmBtnKid.addEventListener("click", confirmPhotoTakenKid);

async function confirmPhotoTakenKid() {
  captureKid.hidden = true;
  retakeKid.hidden = true;
  selectPhotoKid.disabled = false;
  cancelKid.hidden = true;
  confirmBtnKid.hidden = true;
  takePhotoKid.disabled = false;
  takePhotoKid.innerHTML = `<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>retake photo`;
  const tracks = videoKid.srcObject.getTracks();
  tracks.forEach((track) => track.stop());

  const canvasDataURLKid = canvasKid.toDataURL();
  console.log(canvasDataURLKid);
  // const imageBlob = canvas.toBlob(function (blob) {}, "image/jpeg");
  // console.log (imageBlob)

  const imageRef = ref(
    storage,
    `userProfilePic/kids/${auth.currentUser.uid}-kid${kidOrder - 1}`
  );
  // kidProfile/parentID/kidID >> kidID not generate yet, how to fix this?

  // const uploadTask = uploadBytesResumable(imageRef, canvasDataURL);
  // const uploadTask = uploadString(imageRef,canvasDataURL, 'data_url')

  await uploadString(imageRef, canvasDataURLKid, "data_url")
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
    profilePicURLKid = downloadURL;
    console.log(profilePicURLKid);
  });
}

function stopCameraKid() {
  selectPhotoKid.disabled = false;
  const tracks = videoKid.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  takePhotoKid.disabled = false;
  videoAreaKid.hidden = true;
}

cancelKid.addEventListener("click", stopCameraKid);

//upload photo ===============

let imageKid;

fileInputKid.addEventListener("change", (e) => {
  imageKid = e.target.files[0];
});

uploadPhotoKid.addEventListener("submit", (e) => {
  e.preventDefault();

  if (imageKid == null) return;

  console.log(imageKid);

  const imageRef = ref(
    storage,
    `userProfilePic/kids/${auth.currentUser.uid}-kid${kidOrder - 1}`
  );

  const uploadTask = uploadBytesResumable(imageRef, imageKid);
  let uploadPercent = document.createElement("p");

  uploadPhotoKid.appendChild(uploadPercent);
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
          uploadPhotoKid.removeChild(uploadPercent);
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
        uploadPhotoConfirmKid.hidden = false;
        while (uploadPhotoConfirmKid.firstChild) {
          uploadPhotoConfirmKid.removeChild(uploadPhotoConfirmKid.firstChild);
        }
        let completeUploadedPicKid = document.createElement("img");
        completeUploadedPicKid.setAttribute("src", downloadURL);
        uploadPhotoConfirmKid.appendChild(completeUploadedPicKid);

        profilePicURLKid = downloadURL;
      });
    }
  );
});

selectPhotoKid.addEventListener(`click`, () => {
  uploadPhotoKid.classList.toggle("active-div");
  selectPhotoKid.disabled = true;
  videoAreaKid.hidden = true;
  takePhotoKid.disabled = false;
});

// camera for ID Card ================

const videoIDCard = document.getElementById("videoIDCard");

// Elements for taking the snapshot
const canvasIDCard = document.getElementById("canvasIDCard");
const retakeIDCard = document.getElementById("retakeIDCard");
const confirmBtnIDCard = document.getElementById("confirmBtnIDCard");
const captureIDCard = document.getElementById("captureIDCard");
const contextIDCard = canvasIDCard.getContext("2d");
contextIDCard.scale(0.5, 0.5);

const startBtnIDCard = document.getElementById("takeIDCard");
videoAreaIDCard.hidden = true;
// const stopBtn = document.getElementById('stop');

function startCameraIDCard() {
  console.log("startCamera is called");
  // startBtnIDCard.innerHTML = `<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>Take Photo`;
  // uploadPhoto.hidden = true;
  uploadIDCard.classList.remove("active-div");
  uploadIDCardConfirm.hidden = true;
  videoAreaIDCard.hidden = false;
  cancelIDCard.hidden = false;
  selectIDCard.disabled = false;

  videoIDCard.hidden = false;
  captureIDCard.hidden = false;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoIDCard.srcObject = stream;
      // video.play();  // or autplay
      startBtn.disabled = true;
      canvasIDCard.hidden = true;
      confirmBtnIDCard.hidden = true;
      retakeIDCard.hidden = true;
      // stopBtn.disabled = false;
    });
  } else {
    console.log("media devices not available in this browser");
  }
}
startBtnIDCard.addEventListener("click", startCameraIDCard);

// // Trigger photo take for ID Card
captureIDCard.addEventListener("click", snapIDCard);

function snapIDCard() {
  console.log("snapIDCard is called");
  canvasIDCard.hidden = false;
  videoIDCard.hidden = true;
  confirmBtnIDCard.hidden = false;
  retakeIDCard.hidden = false;
  captureIDCard.hidden = true;

  contextIDCard.drawImage(videoIDCard, 0, 0);
}

retakeIDCard.addEventListener("click", startCameraIDCard);

confirmBtnIDCard.addEventListener("click", confirmIDCard);

let IDCardURL = null;

async function confirmIDCard() {
  while (uploadIDCardConfirm.firstChild) {
    uploadIDCardConfirm.removeChild(uploadIDCardConfirm.firstChild);
  }

  captureIDCard.hidden = true;
  retakeIDCard.hidden = true;
  selectIDCard.disabled = false;
  cancelIDCard.hidden = true;
  confirmBtnIDCard.hidden = true;
  startBtnIDCard.disabled = false;
  startBtnIDCard.innerHTML = `<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>retake photo`;
  const tracks = videoIDCard.srcObject.getTracks();
  tracks.forEach((track) => track.stop());

  const IDCardCanvasDataURL = canvasIDCard.toDataURL();
  console.log(IDCardCanvasDataURL);
  // const imageBlob = canvas.toBlob(function (blob) {}, "image/jpeg");
  // console.log (imageBlob)

  const imageRef = ref(storage, `userGuardian/${auth.currentUser.uid}`);

  await uploadString(imageRef, IDCardCanvasDataURL, "data_url")
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
    IDCardURL = downloadURL;
    console.log(IDCardURL);
  });
}

function stopCameraIDCard() {
  selectIDCard.disabled = false;
  const tracks = videoIDCard.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  // startBtn.disabled = false;
  videoAreaIDCard.hidden = true;
}

cancelIDCard.addEventListener("click", stopCameraIDCard);

//upload ID Card ===============

let idCard;

fileInputIDCard.addEventListener("change", (e) => {
  idCard = e.target.files[0];
});

uploadIDCard.addEventListener("submit", (e) => {
  e.preventDefault();

  if (idCard == null) return;

  console.log(idCard);

  const imageRef = ref(storage, `userGuardian/${auth.currentUser.uid}`);

  const uploadTask = uploadBytesResumable(imageRef, idCard);
  console.log(uploadTask);
  let uploadPercent = document.createElement("p");

  uploadIDCard.appendChild(uploadPercent);
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
          uploadIDCard.removeChild(uploadPercent);
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
        canvasIDCard.hidden = true;
        while (uploadIDCardConfirm.firstChild) {
          uploadIDCardConfirm.removeChild(uploadIDCardConfirm.firstChild);
        }
        let completeUploadedPicID = document.createElement("img");
        completeUploadedPicID.setAttribute("src", downloadURL);
        completeUploadedPicID.setAttribute("class", "pictureUpload");
        uploadIDCardConfirm.hidden = false;
        uploadIDCardConfirm.appendChild(completeUploadedPicID);
        profilePicURL = downloadURL;
      });
    }
  );
});

selectIDCard.addEventListener(`click`, () => {
  console.log("selectIDCard");
  uploadIDCard.classList.toggle("active-div");
  selectIDCard.disabled = true;
  videoAreaIDCard.hidden = true;
  startBtn.disabled = false;
});

//draw form>> amount of form equal amont of kid
let arrayOfKidObject = [];
addMoreKid.addEventListener("click", addKidForm);
// *add feature for user to go back and change number of kids
let kidOrder = 2;

addMoreKid.hidden = true;

function addKidForm() {
  addMoreKid.hidden = true;
  // if (kidOrder <= amontOfForm) {
  let formHeadline = document.createElement("p");
  formHeadline.classList.add("kidDetailsHeadline");
  formHeadline.innerHTML = `Kid #${kidOrder}`;

  KidForm.appendChild(formHeadline);

  let labelkidFirstName = document.createElement("label");
  labelkidFirstName.setAttribute(`for`, `labelkidFirstName`);
  labelkidFirstName.setAttribute(`class`, `visually-hidden`);
  labelkidFirstName.innerHTML = `kid First Name`;

  let inputkidFirstName = document.createElement("input");
  inputkidFirstName.setAttribute(`type`, `text`);
  inputkidFirstName.setAttribute(`name`, `labelkidFirstName`);
  inputkidFirstName.setAttribute(`id`, `labelkidFirstName`);
  inputkidFirstName.setAttribute(`placeholder`, `Kid's First Name`);

  KidForm.appendChild(labelkidFirstName);
  KidForm.appendChild(inputkidFirstName);

  let labelKidLastName = document.createElement("label");
  labelKidLastName.setAttribute(`for`, `labelkidLastName`);
  labelKidLastName.setAttribute(`class`, `visually-hidden`);
  labelKidLastName.innerHTML = `KidLastName`;

  let inputKidLastName = document.createElement("input");
  inputKidLastName.setAttribute(`type`, `text`);
  inputKidLastName.setAttribute(`name`, `labelkidLastName`);
  inputKidLastName.setAttribute(`id`, `labelkidLastName`);
  inputKidLastName.setAttribute(`placeholder`, `Kid's Last Name`);

  KidForm.appendChild(labelKidLastName);
  KidForm.appendChild(inputKidLastName);

  let labelkidAge = document.createElement("label");
  labelkidAge.setAttribute(`for`, `labelkidAge`);
  labelkidAge.setAttribute(`class`, `visually-hidden`);
  labelkidAge.innerHTML = `kidAge`;

  let inputkidAge = document.createElement("input");
  inputkidAge.setAttribute(`type`, `number`);
  inputkidAge.setAttribute(`name`, `labelkidAge`);
  inputkidAge.setAttribute(`placeholder`, `Age`);
  inputkidAge.setAttribute(`id`, `labelkidAge`);

  KidForm.appendChild(labelkidAge);
  KidForm.appendChild(inputkidAge);

  let divAllergy = document.createElement("div");
  divAllergy.setAttribute(`id`, `allergyContainer`);
  let divAllergyHeadline = document.createElement("h3");
  divAllergyHeadline.classList.add("kidDetailsHeadline");
  divAllergyHeadline.innerHTML = `Please your kid allergy:<br>`;
  KidForm.appendChild(divAllergyHeadline);
  KidForm.appendChild(divAllergy);

  let checkboxWrap1 = document.createElement("div");
  checkboxWrap1.setAttribute("id", "checkboxWrap1");
  divAllergy.appendChild(checkboxWrap1);
  let labelmilk = document.createElement("label");
  labelmilk.setAttribute(`for`, `labelMilk`);
  labelmilk.innerHTML = `milk`;

  let inputmilk = document.createElement("input");
  inputmilk.setAttribute(`type`, `checkbox`);
  inputmilk.setAttribute(`name`, `labelMilk`);
  inputmilk.setAttribute(`value`, `milk`);
  inputmilk.setAttribute(`id`, `labelMilk`);

  checkboxWrap1.appendChild(inputmilk);
  checkboxWrap1.appendChild(labelmilk);

  let checkboxWrap2 = document.createElement("div");
  checkboxWrap2.setAttribute("id", "checkboxWrap2");
  divAllergy.appendChild(checkboxWrap2);

  let labelEgg = document.createElement("label");
  labelEgg.setAttribute(`for`, `labelEgg`);
  labelEgg.innerHTML = `Egg`;

  let inputEgg = document.createElement("input");
  inputEgg.setAttribute(`type`, `checkbox`);
  inputEgg.setAttribute(`name`, `labelEgg`);
  inputEgg.setAttribute(`value`, `Egg`);
  inputEgg.setAttribute(`id`, `labelEgg`);

  checkboxWrap2.appendChild(inputEgg);
  checkboxWrap2.appendChild(labelEgg);

  let checkboxWrap3 = document.createElement("div");
  checkboxWrap3.setAttribute("id", "checkboxWrap3");
  divAllergy.appendChild(checkboxWrap3);

  let labelPeanut = document.createElement("label");
  labelPeanut.setAttribute(`for`, `labelPeanut`);
  labelPeanut.innerHTML = `Peanut`;

  let inputPeanut = document.createElement("input");
  inputPeanut.setAttribute(`type`, `checkbox`);
  inputPeanut.setAttribute(`name`, `labelPeanut`);
  inputPeanut.setAttribute(`value`, `Peanut`);
  inputPeanut.setAttribute(`id`, `labelPeanut`);

  checkboxWrap3.appendChild(inputPeanut);
  checkboxWrap3.appendChild(labelPeanut);

  let checkboxWrap4 = document.createElement("div");
  checkboxWrap4.setAttribute("id", "checkboxWrap4");
  divAllergy.appendChild(checkboxWrap4);

  let labelGluten = document.createElement("label");
  labelGluten.setAttribute(`for`, `labelGluten`);
  labelGluten.innerHTML = `Gluten`;

  let inputGluten = document.createElement("input");
  inputGluten.setAttribute(`type`, `checkbox`);
  inputGluten.setAttribute(`name`, `labelGluten`);
  inputGluten.setAttribute(`value`, `Gluten`);
  inputGluten.setAttribute(`id`, `labelGluten`);

  checkboxWrap4.appendChild(inputGluten);
  checkboxWrap4.appendChild(labelGluten);

  let checkboxWrap5 = document.createElement("div");
  checkboxWrap5.setAttribute("id", "checkboxWrap5");
  divAllergy.appendChild(checkboxWrap5);

  let labelOtherAllergy = document.createElement("label");
  labelOtherAllergy.setAttribute(`for`, `labelOtherAllergy`);
  labelOtherAllergy.innerHTML = `OtherAllergy`;

  let inputOtherAllergy = document.createElement("input");
  inputOtherAllergy.setAttribute(`type`, `text`);
  inputOtherAllergy.setAttribute(`name`, `labelOtherAllergy`);
  inputOtherAllergy.setAttribute(`id`, `labelOtherAllergy`);

  checkboxWrap5.appendChild(labelOtherAllergy);
  checkboxWrap5.appendChild(inputOtherAllergy);

  let labelSchool = document.createElement("label");
  labelSchool.setAttribute(`for`, `labelSchool`);
  labelSchool.setAttribute(`class`, `visually-hidden`);
  divAllergy;
  labelSchool.innerHTML = `School`;

  let inputSchool = document.createElement("input");
  inputSchool.setAttribute(`type`, `text`);
  inputSchool.setAttribute(`name`, `labelSchool`);
  inputSchool.setAttribute(`id`, `labelSchool`);
  inputSchool.setAttribute(`placeholder`, `School`);

  KidForm.appendChild(labelSchool);
  KidForm.appendChild(inputSchool);

  let createMap = document.createElement("div");
  createMap.setAttribute(`id`, `map`);
  KidForm.appendChild(createMap);

  let createInfobox = document.createElement("div");
  createInfobox.setAttribute(`id`, `infowindow-content`);
  KidForm.appendChild(createInfobox);

  let createPlaceName = document.createElement("span");
  createPlaceName.setAttribute(`id`, `place-name`);
  let createBR = document.createElement("br");
  createInfobox.appendChild(createPlaceName);
  createInfobox.appendChild(createBR);
  let createPlaceAddress = document.createElement("span");
  createPlaceAddress.setAttribute(`id`, `place-address`);
  createInfobox.appendChild(createPlaceAddress);

  let labelSpecialNote = document.createElement("label");
  labelSpecialNote.setAttribute(`for`, `labelSpecialNote`);
  labelSpecialNote.setAttribute(`class`, `visually-hidden`);
  labelSpecialNote.innerHTML = `Special note:`;

  let inputSpecialNote = document.createElement("input");
  inputSpecialNote.setAttribute(`type`, `text`);
  inputSpecialNote.setAttribute(`name`, `labelSpecialNote`);
  inputSpecialNote.setAttribute(`placeholder`, `Special Note`);
  inputSpecialNote.setAttribute(`id`, `labelSpecialNote`);

  KidForm.appendChild(labelSpecialNote);
  KidForm.appendChild(inputSpecialNote);

  let createKidPhotoHeadline = document.createElement("h3");
  createKidPhotoHeadline.innerHTML = `Kid's profile picture`;
  createKidPhotoHeadline.setAttribute("class", "photoUploadHeadline");
  KidForm.appendChild(createKidPhotoHeadline);
  let createPhotoDiv = document.createElement("div");
  createPhotoDiv.setAttribute("class", "photoUpload");
  KidForm.appendChild(createPhotoDiv);
  let takePhotoKid = document.createElement("button");
  takePhotoKid.setAttribute("id", "takePhotoKid");
  takePhotoKid.setAttribute("class", "photoBtn");
  takePhotoKid.setAttribute("type", "button");
  takePhotoKid.innerHTML =
    '<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>Take Photo';
  createPhotoDiv.appendChild(takePhotoKid);
  let selectPhotoKid = document.createElement("button");
  selectPhotoKid.setAttribute("id", "selectPhotoKid");
  selectPhotoKid.setAttribute("class", "photoBtn");
  selectPhotoKid.setAttribute("type", "button");
  selectPhotoKid.innerHTML = `<i class="fa-solid fa-upload" aria-hidden=“true”></i><br>
  Select Photo`;
  createPhotoDiv.appendChild(selectPhotoKid);
  let uploadPhotoKid = document.createElement("form");
  uploadPhotoKid.setAttribute("id", "uploadPhotoKid");
  uploadPhotoKid.setAttribute("class", "inactive-div");
  createPhotoDiv.appendChild(uploadPhotoKid);
  let label1 = document.createElement("label");
  label1.setAttribute("for", "fileInput");
  uploadPhotoKid.appendChild(label1);
  let fileInputKid = document.createElement("input");
  fileInputKid.setAttribute("id", "fileInputKid");
  fileInputKid.setAttribute("type", "file");
  fileInputKid.setAttribute("accept", "image/png, image/jpeg");
  fileInputKid.required = true;
  uploadPhotoKid.appendChild(fileInputKid);
  let btn3 = document.createElement("button");
  btn3.setAttribute("type", "upload");
  btn3.innerHTML = "Submit";
  uploadPhotoKid.appendChild(btn3);
  let uploadPhotoConfirmKid = document.createElement("div");
  uploadPhotoConfirmKid.setAttribute("id", "uploadPhotoConfirmKid");
  createPhotoDiv.appendChild(uploadPhotoConfirmKid);
  let videoAreaKid = document.createElement("div");
  videoAreaKid.setAttribute("id", "videoAreaKid");
  createPhotoDiv.appendChild(videoAreaKid);
  let videoKid = document.createElement("video");
  videoKid.setAttribute("id", "videoKid");
  videoKid.setAttribute("width", "320");
  videoKid.setAttribute("height", "240");
  videoKid.autoplay = true;
  videoAreaKid.appendChild(videoKid);
  let canvasKid = document.createElement("canvas");
  canvasKid.setAttribute("id", "canvasKid");
  canvasKid.setAttribute("width", "320");
  canvasKid.setAttribute("height", "240");
  videoAreaKid.appendChild(canvasKid);
  let br1 = document.createElement("br");
  videoAreaKid.appendChild(br1);
  let cancelKid = document.createElement("button");
  cancelKid.setAttribute("id", "cancelKid");
  cancelKid.setAttribute("type", "button");
  cancelKid.innerHTML = "cancel";
  videoAreaKid.appendChild(cancelKid);
  let captureKid = document.createElement("button");
  captureKid.setAttribute("id", "captureKid");
  captureKid.setAttribute("type", "button");
  captureKid.innerHTML = "capture";
  videoAreaKid.appendChild(captureKid);
  let retakeKid = document.createElement("button");
  retakeKid.setAttribute("id", "retakeKid");
  retakeKid.setAttribute("type", "button");
  retakeKid.innerHTML = "retake";
  videoAreaKid.appendChild(retakeKid);
  let confirmBtnKid = document.createElement("button");
  confirmBtnKid.setAttribute("id", "confirmBtnKid");
  confirmBtnKid.setAttribute("type", "button");
  confirmBtnKid.innerHTML = "confirm";
  videoAreaKid.appendChild(confirmBtnKid);

  let confirmKidDetailsBtn = document.createElement("button");
  confirmKidDetailsBtn.setAttribute(`type`, `button`);
  confirmKidDetailsBtn.setAttribute(`id`, `confirmKidDetailsBtn`);
  confirmKidDetailsBtn.classList.add(`addMoreBtn`);
  // confirmKidDetailsBtn.setAttribute(`onclick`, `createKidObject()`);
  confirmKidDetailsBtn.innerHTML = `confirm kid#${kidOrder} details`;

  KidForm.appendChild(confirmKidDetailsBtn);
  confirmKidDetailsBtn.addEventListener("click", confirmKid);

  // =================
  videoAreaKid.hidden = true;
  // const stopBtn = document.getElementById('stop');
  const contextKid = canvasKid.getContext("2d");
  contextKid.scale(0.5, 0.5);
  function startCameraKid() {
    console.log("startCamera is called");
    while (uploadPhotoConfirmKid.firstChild) {
      uploadPhotoConfirmKid.removeChild(uploadPhotoConfirmKid.firstChild);
    }
    console.log("test");
    takePhotoKid.innerHTML = `<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>Take Photo`;
    // uploadPhoto.hidden = true;
    uploadPhotoKid.classList.remove("active-div");
    uploadPhotoConfirmKid.hidden = true;
    videoAreaKid.hidden = false;
    cancelKid.hidden = false;
    selectPhotoKid.disabled = false;

    videoKid.hidden = false;
    captureKid.hidden = false;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoKid.srcObject = stream;
        // video.play();  // or autplay
        takePhotoKid.disabled = true;
        canvasKid.hidden = true;
        confirmBtnKid.hidden = true;
        retakeKid.hidden = true;
        // stopBtn.disabled = false;
      });
    } else {
      console.log("media devices not available in this browser");
    }
  }
  takePhotoKid.addEventListener("click", startCameraKid);

  // // Trigger photo take
  captureKid.addEventListener("click", snapPhotoKid);

  function snapPhotoKid() {
    console.log("snapPhoto is called");
    canvasKid.hidden = false;
    videoKid.hidden = true;
    confirmBtnKid.hidden = false;
    retakeKid.hidden = false;
    captureKid.hidden = true;

    contextKid.drawImage(videoKid, 0, 0);
    console.log(contextKid);
  }

  retakeKid.addEventListener("click", startCameraKid);

  confirmBtnKid.addEventListener("click", confirmPhotoTakenKid);

  async function confirmPhotoTakenKid() {
    captureKid.hidden = true;
    retakeKid.hidden = true;
    selectPhotoKid.disabled = false;
    cancelKid.hidden = true;
    confirmBtnKid.hidden = true;
    takePhotoKid.disabled = false;
    takePhotoKid.innerHTML = `<i class="fa-solid fa-camera" aria-hidden=“true”></i><br>retake photo`;
    const tracks = videoKid.srcObject.getTracks();
    tracks.forEach((track) => track.stop());

    const canvasDataURLKid = canvasKid.toDataURL();
    console.log(canvasDataURLKid);
    // const imageBlob = canvas.toBlob(function (blob) {}, "image/jpeg");
    // console.log (imageBlob)

    const imageRef = ref(
      storage,
      `userProfilePic/kids/${auth.currentUser.uid}-kid${kidOrder - 1}`
    );

    // const uploadTask = uploadBytesResumable(imageRef, canvasDataURL);
    // const uploadTask = uploadString(imageRef,canvasDataURL, 'data_url')

    await uploadString(imageRef, canvasDataURLKid, "data_url")
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
      profilePicURLKid = downloadURL;
      console.log(profilePicURLKid);
    });
  }

  function stopCameraKid() {
    selectPhotoKid.disabled = false;
    const tracks = videoKid.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    takePhotoKid.disabled = false;
    videoAreaKid.hidden = true;
  }

  cancelKid.addEventListener("click", stopCameraKid);

  // ================

  let imageKid;

  fileInputKid.addEventListener("change", (e) => {
    imageKid = e.target.files[0];
  });

  uploadPhotoKid.addEventListener("submit", (e) => {
    e.preventDefault();

    if (imageKid == null) return;

    console.log(imageKid);

    const imageRef = ref(
      storage,
      `userProfilePic/kids/${auth.currentUser.uid}-kid${kidOrder - 1}`
    );

    const uploadTask = uploadBytesResumable(imageRef, imageKid);
    let uploadPercent = document.createElement("p");

    uploadPhotoKid.appendChild(uploadPercent);
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
            uploadPhotoKid.removeChild(uploadPercent);
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
          uploadPhotoConfirmKid.hidden = false;
          while (uploadPhotoConfirmKid.firstChild) {
            uploadPhotoConfirmKid.removeChild(uploadPhotoConfirmKid.firstChild);
          }
          let completeUploadedPicKid = document.createElement("img");
          completeUploadedPicKid.setAttribute("src", downloadURL);
          uploadPhotoConfirmKid.appendChild(completeUploadedPicKid);

          profilePicURLKid = downloadURL;
        });
      }
    );
  });

  selectPhotoKid.addEventListener(`click`, () => {
    uploadPhotoKid.classList.toggle("active-div");
    selectPhotoKid.disabled = true;
    videoAreaKid.hidden = true;
    takePhotoKid.disabled = false;
  });
  initAutocomplete();
  initMap();

  kidOrder++;
  // console.log(allAutoComplete);
  // console.log(allAutoComplete[0].id);

  // }
  // else {
  //   //activate register button
  //   console.log("else");
  // }
}

//add next kid>>remove confirmKidDetailsBtn from previous kid's form>>create previous kid object>>draw form for next kid

function confirmKid() {
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

  const kid = new kidObject(
    labelkidFirstName.value,
    labelkidLastName.value,
    labelkidAge.value,
    allergyArr,
    JSON.parse(JSON.stringify(addedSchool)),
    labelSpecialNote.value,
    profilePicURLKid
  );
  kid.pushToArrayOfKidObject(kid);
  console.log(arrayOfKidObject);

  // display previous object with edit button
  let kidOrder2 = 1;
  for (let item of arrayOfKidObject) {
    let addedKid = document.createElement("div");
    addedKid.innerHTML = `Kid#${kidOrder2}`;
    addedKid.innerHTML += `<br>First name: <span><strong>${item.kidFirstNameadded}</strong></span>`;
    addedKid.innerHTML += `<br>Last name: <span><strong>${item.kidLastNameadded}</strong></span>`;
    addedKid.innerHTML += `<br>Age: <span><strong>${item.kidAgeadded}</strong></span>`;
    addedKid.innerHTML += `<br>Allergy: <span><strong>${item.allergy}</strong></span>`;
    addedKid.innerHTML += `<br>School: <span><strong>${item.schooladded.schoolName}</strong></span>`;
    addedKid.innerHTML += `<br>Special notes: <span><strong>${item.specialNoteadded}</strong></span>`;
    addedKid.innerHTML += `<br>Profile picture:<img src="${item.profileImgKidadded}" />`;
    kidOrder2++;
    kidAddedDetails.appendChild(addedKid);
  }
  // ** add edit button

  // remove previous form

  while (KidForm.firstChild) {
    KidForm.removeChild(KidForm.firstChild);
  }
  addMoreKid.innerHTML = "+Add more kid";

  addMoreKid.hidden = false;
  // addKidForm();
  // console.log(arrayOfKidObject);
}
confirmKidDetailsBtn.addEventListener("click", confirmKid);
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
    this.kidAgeadded = Number(kidAgeadded);
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

    // create documents in database (notification, events)
    // notification
    const notifRef = doc(collection(firestore, `notifications`), uidNewUser);
    const notifCreate = await setDoc(notifRef, {
      timestamp: Timestamp.now(),
    });
    console.log(`Notif: ${notifCreate}`);

    //events
    const eventRef = doc(collection(firestore, `events`), uidNewUser);
    const eventCreate = await setDoc(eventRef, {
      timestamp: Timestamp.now(),
    });
    console.log(`Event: ${eventCreate}`);

    // write kid document to subcollection

    const targetSubCollection = collection(
      firestore,
      `users/${uidNewUser}/kids`
    );
    console.log(arrayOfKidObject);
    for (let item of arrayOfKidObject) {
      let a = JSON.parse(JSON.stringify(item));
      let result = await addDoc(targetSubCollection, a).then(async (kidRef) => {
        console.log(kidRef);
        let kidDoc = doc(firestore, `users/${uidNewUser}/kids/${kidRef.id}`);
        await updateDoc(kidDoc, { id: kidRef.id }); // Add id to kid object (needed for Give Care)
      });
    }

    console.log(`add to Database successfully`);
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}

submitBtnSignUp2.addEventListener("click", addUserToDatabase);

// LOGOUT========
async function logout() {
  await signOut(auth);
  window.location.href = "/";
  //   clearAuthStateToOutput();
}
backBtnSignUp2.addEventListener(`click`, () => {
  logout();
});

// map auto complete

let apiKey = "";

// Create the script tag, set the appropriate attributes
let script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=init`;
script.async = true;
script.defer = true;

window.init = function init() {
  initAutocomplete();
  initMap();
};

// Initialize and add the map
let liveLocation = { lat: 49.256139, lng: -123.116389 };
let map;
let infowindow;
let infowindowContent;
// let registeredSchool = [];
let autoComplete;

function initMap() {
  // The map
  //   infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: liveLocation,
  });
}

// window.initAutocomplete = function initAutocomplete() {
function initAutocomplete() {
  autoComplete = new google.maps.places.Autocomplete(
    document.getElementById("labelSchool"),
    {
      types: ["school"],
      componentRestrictions: { country: ["CA"] },
      fields: ["place_id", "geometry", "formatted_address", "name"],
    }
  );

  // places = new google.maps.places.PlacesService(map);
  autoComplete.addListener("place_changed", onPlaceChanged);
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
  const marker = new google.maps.Marker({
    map,
  });

  infowindow = new google.maps.InfoWindow();
  infowindowContent = document.getElementById("infowindow-content");

  infowindow.setContent(infowindowContent);

  const place = autoComplete.getPlace();

  if (place.geometry && place.geometry.location) {
    map.panTo(place.geometry.location);
    map.setZoom(15);
    // search();

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    console.log(place.name);
    console.log(`place =`);
    console.log(place);
    addedSchool = {
      schoolName: place.name,
      schoolAddress: place.formatted_address,
      schoolPlaceID: place.place_id,
    };
    // registeredSchool.push(addedSchool);
    // console.log (registeredSchool)
    infowindowContent.children["place-name"].textContent = place.name;

    infowindowContent.children["place-address"].textContent =
      place.formatted_address;
    infowindow.open(map, marker);
  } else {
    document.getElementById("schoolOfKid").placeholder =
      "Enter a School's name and choose from the list";
  }
  // marker.setPosition(place.geometry.location);
  // marker.setVisible(true);
  // infowindowContent["place-name"].textContent = place.name;
  // infowindowContent["place-address"].textContent +=
  //   place.formatted_address;
  // infowindow.open(map, marker);
}

// Append the 'script' element to 'head'
document.head.appendChild(script);

function mobileMenu() {
  desktopMenu.classList.toggle("mobile-menu-active");
}
hamburgerBtn.addEventListener("click", mobileMenu);
