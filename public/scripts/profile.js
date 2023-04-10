// import and initialize **************
import { initialize } from "./firebase.js";
import { getFirebase, createFriendRequestNotification, createFriendAcceptNotification,updateNotificationAsRead } from "./firebase-disable.js";
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
  onSnapshot,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const { auth } = initialize();
const { firestore } = initialize();

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
    
    getKidData();
    showFriendList();
  } else {
    let notLoggedInMessage = ` you're not logged in.`;
    //   console.log(notLoggedInMessage);
    showAuthStateToOutput(notLoggedInMessage);
  }
}

function showAuthStateToOutput(userFirstNameParent, parentScore) {
   let createScoreImg = document.createElement("img");
  createScoreImg.setAttribute ('src','../icons/CoCoin.png');
  let createScoreText = document.createElement ('p');
  createScoreText.innerHTML = parentScore;
  scoreOutput.appendChild(createScoreText);
  scoreOutput.appendChild(createScoreImg);

  welcomeUserName.innerHTML = userFirstNameParent;
  userProfilePicProfile.setAttribute("src", userprofileImgParent);
  userFirstNameProfile.innerHTML = userFirstNameParent;
  userLastNameProfile.innerHTML = userLastNameParent;
  userProfilePicMenu.setAttribute("src", userprofileImgParent);
  userFirstNameMenu.innerHTML = userFirstNameParent;
  userLastNameMenu.innerHTML = userLastNameParent;


}

//retrive kid data

let displayKidDataArray = [];
async function getKidData() {
  try {
    console.log(activeUserDocId);
    const kidQuery = query(
      collection(firestore, `users/${activeUserDocId}/kids`),
      limit(10)
    );
    console.log(kidQuery);

    const querySnapshot = await getDocs(kidQuery);
    console.log(querySnapshot);

    const searchResult = await querySnapshot.forEach((key) => {
      console.log(`searchResult`);

      let object = {
        objectName: `${key.data().kidFirstNameadded} ${
          key.data().kidLastNameadded
        }`,
        objectProfilePic: key.data().profileImgKidadded,
        objectSchool: key.data().schooladded,
        objectUID: key.id,
      };
      console.log(`object = ${object}`);
      displayKidDataArray.push(object);
    });
    console.log(displayKidDataArray);
    outputKidData();
  } catch (error) {
    console.log(error);
  }
}

function outputKidData() {
  for (let i = 0; i < displayKidDataArray.length; i++) {
    console.log(displayKidDataArray[i].objectName);
    // let kidBox = document.createElement('div')
    // kidBox.setAttribute('id', `kid${i}`)
    // kidBox.setAttribute('class', 'kidBox')
    // kidArea.append(kidBox)
    let kidCard = document.createElement("div");
    kidCard.setAttribute("class", "kidCard");
    // kidCard.setAttribute ('id', 'kidCard');
    kidArea.appendChild(kidCard);
    let kidPhoto = document.createElement("img");
    kidPhoto.setAttribute("src", displayKidDataArray[i].objectProfilePic);
    console.log(kidPhoto);
    kidCard.appendChild(kidPhoto);
    let kidName = document.createElement("p");
    kidName.innerHTML = `${displayKidDataArray[i].objectName}`;
    kidCard.appendChild(kidName);
    let kidSchool = document.createElement("p");
    kidSchool.innerHTML = `${displayKidDataArray[i].objectSchool.schoolName}`;
    kidCard.appendChild(kidSchool);
  }

  // displayKidDataArray.forEach( ()=>{

  // })
}


// export function loadProfile(uid) {
//   console.log(uid);
// }

let friendListArray = [];
let friendRequestTrue = [];
let allAcceptButton = [];
let allChatBtn = [];
let i = document.createElement("p");
let o = 0;
async function showFriendList() {
  console.log("showFriendList is called");
  try {
    // getting path to current user document
    console.log(`activeUserDocId=` + activeUserDocId);

    const searchFriendRequestQuery = query(
      collection(firestore, `users/${activeUserDocId}/friend_request`),
      where("requestStatus", "==", true),
      limit(10)
    );
    // ================
    // const querySnapshot = await getDocs(searchFriendRequestQuery);
    // let friendRequestHeadline = document.createElement("h3");
    // friendRequestHeadline.setAttribute(`id`, `friendRequestHeadline`);
    // friendRequestHeadline.setAttribute(`class`, `friendRequestHeadline`);
    // friendRequestHeadline.innerHTML = "Friend request";
    // friendRequestOutput.appendChild(friendRequestHeadline);
    // let friendRequestCardWrap = document.createElement("div");
    // friendRequestCardWrap.setAttribute(`id`, `friendRequestCardWrap`);
    // friendRequestCardWrap.setAttribute(`class`, `friendRequestCardWrap`);
    // friendRequestOutput.appendChild(friendRequestCardWrap);
    // onSnapshot(searchFriendRequestQuery, (querySnapshot) => {
    //   querySnapshot.forEach((doc) => {
    //     i.innerHTML += doc.data().friendRequestFromFirstNameParent;
    //     console.log(i);
    //     console.log(o);
    //     let friendRequestCard = document.createElement("div");
    //     friendRequestCard.setAttribute(`id`, `friendRequestCard`);
    //     friendRequestCard.setAttribute(`class`, `friendRequestCard`);
    //     friendRequestCardWrap.appendChild(friendRequestCard);

    //     let createNewParagraph = document.createElement("p");
    //     createNewParagraph.setAttribute(`id`, `friendRequestResult`);
    //     createNewParagraph.innerHTML = `${
    //       doc.data().friendRequestFromFirstNameParent
    //     } ${doc.data().friendRequestFromLastNameParent}`;
    //     // console.log(friendRequestTrue[i].objectProfilePic);
    //     let createFriendRequestProfilePic = document.createElement("img");
    //     createFriendRequestProfilePic.setAttribute(
    //       `src`,
    //       `${doc.data().friendRequestFromProfileImgParent}`
    //     );

    //     let acceptFriendBtn = document.createElement("button");
    //     acceptFriendBtn.setAttribute(`id`, `acceptFriendBtn(${i})`);
    //     acceptFriendBtn.setAttribute(`class`, `acceptFriendBtn`);
    //     // acceptFriendBtn.setAttribute(`onclick`, `acceptFriend(${i})`);

    //     // acceptFriendBtn.onclick = acceptFriend(`${i}`);
    //     acceptFriendBtn.setAttribute(`type`, `button`);
    //     acceptFriendBtn.innerHTML = "Accept";

    //     friendRequestCard.appendChild(createNewParagraph);
    //     friendRequestCard.appendChild(createFriendRequestProfilePic);
    //     friendRequestCard.appendChild(acceptFriendBtn);

    // console.log(allAcceptButton);

    // let object = {
    //   objectName: `${doc.data().friendRequestFromFirstNameParent} ${
    //     doc.data().friendRequestFromLastNameParent
    //   }`,
    //   objectProfilePic: doc.data().friendRequestFromProfileImgParent,
    //   objectAuthorized: doc.data().friendSchoolAuthorized,
    //   objectUID: doc.data().friendRequestFromUid,
    // };
    // friendRequestTrue.push(object);
    //     o++;
    //   });
    // });
    // allAcceptButton = document.querySelectorAll(".acceptFriendBtn");
    // console.log(allAcceptButton)
    // console.log(`friendRequestTrue`);
    // console.log(friendRequestTrue);
    // console.log(friendRequestTrue.length);
    // ================
    const querySnapshot2 = await getDocs(searchFriendRequestQuery);
    console.log(querySnapshot2);
    const searchResult = await querySnapshot2.forEach((key) => {
      console.log(key);
      let object = {
        objectName: `${key.data().friendRequestFromFirstNameParent} ${
          key.data().friendRequestFromLastNameParent
        }`,
        objectProfilePic: key.data().friendRequestFromProfileImgParent,
        objectAuthorized: key.data().friendSchoolAuthorized,
        objectUID: key.data().friendRequestFromUid,
      };
      friendRequestTrue.push(object);
    });
    console.log(`friendRequestTrue`);
    console.log(friendRequestTrue);
    console.log(friendRequestTrue.length);
    // ================

    function drawFriendRequestList() {
      let friendRequestHeadline = document.createElement("h3");
      friendRequestHeadline.setAttribute(`id`, `friendRequestHeadline`);
      friendRequestHeadline.setAttribute(`class`, `friendRequestHeadline`);
      friendRequestHeadline.innerHTML = "Friend request";
      friendRequestOutput.appendChild(friendRequestHeadline);
      let friendRequestCardWrap = document.createElement("div");
      friendRequestCardWrap.setAttribute(`id`, `friendRequestCardWrap`);
      friendRequestCardWrap.setAttribute(`class`, `friendRequestCardWrap`);
      friendRequestOutput.appendChild(friendRequestCardWrap);

      for (let i = 0; i < friendRequestTrue.length; i++) {
        let friendRequestCard = document.createElement("div");
        friendRequestCard.setAttribute(`id`, `friendRequestCard`);
        friendRequestCard.setAttribute(`class`, `friendRequestCard`);
        friendRequestCardWrap.appendChild(friendRequestCard);

        let createNewParagraph = document.createElement("p");
        createNewParagraph.setAttribute(`id`, `friendRequestResult`);
        createNewParagraph.innerHTML = friendRequestTrue[i].objectName;
        // console.log(friendRequestTrue[i].objectProfilePic);
        let createFriendRequestProfilePicWrap = document.createElement('div')
        
        let createFriendRequestProfilePic = document.createElement("img");
        createFriendRequestProfilePic.setAttribute(
          `src`,
          `${friendRequestTrue[i].objectProfilePic}`
        );
        createFriendRequestProfilePicWrap.appendChild(createFriendRequestProfilePic)
        let acceptFriendBtn = document.createElement("button");
        acceptFriendBtn.setAttribute(`id`, `acceptFriendBtn(${i})`);
        acceptFriendBtn.setAttribute(`class`, `acceptFriendBtn`);
        // acceptFriendBtn.setAttribute(`onclick`, `acceptFriend(${i})`);

        // acceptFriendBtn.onclick = acceptFriend(`${i}`);
        acceptFriendBtn.setAttribute(`type`, `button`);
        acceptFriendBtn.innerHTML = "Accept";

        friendRequestCard.appendChild(createNewParagraph);
        friendRequestCard.appendChild(createFriendRequestProfilePicWrap);
        friendRequestCard.appendChild(acceptFriendBtn);
        allAcceptButton = document.querySelectorAll(".acceptFriendBtn");
        console.log(allAcceptButton);
      }
    }

    drawFriendRequestList();

    // ** add another function to draw the friend added together with friendlist button

    for (let i = 0; i < allAcceptButton.length; i++) {
      console.log(i);
      allAcceptButton[i].addEventListener("click", function () {
        acceptFriend(i);
        allAcceptButton[i].innerHTML = "Accepted!";
        // allAcceptButton[i].style.color = "green";
        allAcceptButton[i].style.backgroundColor = "#0fabdc";
        allAcceptButton[i].disable = true;

        // drawFriendRequestList();
        // showFriendList()

        // setTimeout(() => {
        //   drawFriendRequestList();
        // }, 2000);
      });
    }

    // fixed issue when there is no user in database with that
    // config the database to only allow searchForFriend when user logged in already.

    // friend list

    const searchFriendListQuery = query(
      collection(firestore, `users/${activeUserDocId}/friends`),
      where("friendStatus", "==", true),
      limit(10)
    );

    const friendListQuerySnapshot = await getDocs(searchFriendListQuery);
    console.log(friendListQuerySnapshot);
    const friendListSearchResult = await friendListQuerySnapshot.forEach(
      (doc) => {
        // console.log(doc);
        let object = {
          objectName: `${doc.data().friendFirstName} ${
            doc.data().friendLastName
          }`,
          objectUID: doc.data().FriendUID,
          objectProfileImg: doc.data().friendProfileImgParent,
          objectSchoolAuthorized: doc.data().friendSchoolAuthorized,
        };
        friendListArray.push(object);
        // console.log(friendListArray);
      }
    );

    function drawFriendList() {
      console.log(`friendListArray ${friendListArray}`);
      for (let i = 0; i < friendListArray.length; i++) {
        let profileCard = document.createElement("div");
        profileCard.setAttribute("id", "friendCard");
        profileCard.setAttribute("class", "friendCard");
        friendOutput.appendChild(profileCard);
        let createNameParagraph = document.createElement("a");
        // createNameParagraph.setAttribute(`href`, `// *** create a link to profile page with query to UID `);
        createNameParagraph.innerHTML = friendListArray[i].objectName;
        // createNameParagraph.setAttribute ('href','link to user profile page')
        let createProfilePicWrap = document.createElement('div')
        let createProfilePic = document.createElement("img");
        createProfilePic.setAttribute(
          `src`,
          `${friendListArray[i].objectProfileImg}`
        );
        console.log(friendListArray[i].objectProfileImg);
        createProfilePicWrap.appendChild(createProfilePic)
        let createAuthorizedParagraph = document.createElement("p");

        // createAuthorizedParagraph.innerHTML = friendListArray[i].objectSchoolAuthorized;

        let chatBtn = document.createElement("button");
        chatBtn.setAttribute("id", `${friendListArray[i].objectUID}`);
        chatBtn.setAttribute("class", "chatBtn");
        chatBtn.innerHTML =
          '<i class="fa-solid fa-comments" aria-hidden=“true”></i> Chat';

        // *** create a link to profile page with query to UID

        profileCard.appendChild(createNameParagraph);
        profileCard.appendChild(createProfilePicWrap);
        profileCard.appendChild(chatBtn);
        profileCard.appendChild(createAuthorizedParagraph);
        allChatBtn = document.querySelectorAll('.chatBtn')
        console.log(allChatBtn)
      }
    }

    drawFriendList();

    for (let i = 0; i < allChatBtn.length; i++) {
      console.log(i);
      allChatBtn[i].addEventListener("click", function () {
        // acceptFriend(i);
        // allChatBtn[i].innerHTML = "Accepted!";
        // allChatBtn[i].style.color = "green";
        allChatBtn[i].style.backgroundColor = "#0fabdc";
        // allChatBtn[i].disable = true;
        window.location.href = '/messages'
        // alert('chat')
        // drawFriendRequestList();
        // showFriendList()

        // setTimeout(() => {
        //   drawFriendRequestList();
        // }, 2000);
      });
    }

    
  } catch (error) {
    console.log(error);
  }
}

//accepting friend request

// after click "friend list"

// >> loop through "friend_request" in database to display pending request
// >>>>>> show "accept" and "decline" button
// >>>>>>>>>>>> if accept update database by delete the pending request in friend_request and add document in friend_list with data 1. username 2. profilePic 3. timestamp and ask user to set this friend as authorize person with school and update database field
// >>>>>>>>>>>> if decline, delete request in database
// >> loop through "friend_list" in database to display existing friends with chat button and link to see full profile

async function acceptFriend(e) {
  try {
    console.log(e);
    let acceptedUid = friendRequestTrue[e].objectUID;
    console.log(acceptedUid);
    const updateRequestStatus = {
      requestStatus: false,
    };

    const requestedDoc = doc(
      firestore,
      `users/${activeUserDocId}/friend_request/${acceptedUid}`
    );
    await updateDoc(requestedDoc, updateRequestStatus);

    // create notification for friend request accepted
    const friendAccept = await createFriendAcceptNotification(activeUserDocId, acceptedUid);

    // query for added user in database>send that data to friends subcollection
    const searchFriendQuery = query(
      collection(firestore, "users"),
      where("uid", "==", acceptedUid),
      limit(1)
    );

    const querySnapshot = await getDocs(searchFriendQuery);
    let addedFriend = null;
    const searchResult = await querySnapshot.forEach((key) => {
      addedFriend = {
        FriendUID: key.data().uid,
        friendStatus: true,
        friendFirstName: key.data().firstNameParent,
        friendLastName: key.data().lastNameParent,
        friendProfileImgParent: key.data().profileImgParent,
        friendSchoolAuthorized: null,
      };
    });

    const friendsDoc = doc(
      firestore,
      `users/${activeUserDocId}/friends/${acceptedUid}`
    );

    await setDoc(friendsDoc, addedFriend);
    console.log(`recieved and accepted`);

    // drawFriendRequestList();
    // change friend status for sender

    const updateRequestStatusSender = {
      // data from current user
      FriendUID: activeUserDocId,
      friendStatus: true,
      friendFirstName: userFirstNameParent,
      friendLastName: userLastNameParent,
      friendProfileImgParent: userprofileImgParent,
      friendSchoolAuthorized: null,
    };

    const acceptedDocBackToSender = doc(
      firestore,
      `users/${acceptedUid}/friends/${activeUserDocId}`
    );
    await setDoc(acceptedDocBackToSender, updateRequestStatusSender);
    console.log(`accepted successful`);
    // while (friendRequestOutput.firstChild) {
    //   friendRequestOutput.removeChild(friendRequestOutput.firstChild);
    //   console.log(`remove success`)
    // }
    // while (friendOutput.firstChild) {
    //   friendOutput.removeChild(friendOutput.firstChild);
    // }
    // showFriendList();
    // monitorAuthState();
    location.replace("profile");
  } catch (error) {
    console.log(error);
  }
}

async function searchForFriend(e) {
  try {
    if (e.key === "Enter") {
      console.log(`search for friend is called`);

      // const userCollection = collection(firestore,'users');
      // const querySnapshot = await userCollection.where("firstNameParent", "==", searchInput.value).where("lastNameParent", "==", searchInput.value);

      // const searchFriendQuery = query(
      //   collection(firestore, "users"),
      //   where("firstNameParent", "==", searchInput.value),
      //   // where("lastNameParent", "==", searchInput.value),
      //   // ***problem when try search in both firstname and last name
      //   limit(10)
      // );

      // making search input case insensitive
      //  let serchInput = searchInput.value;
      //   let caseInsensitiveSearch = /serchInput/i;
      //  console.log (caseInsensitiveSearch);

      const searchFriendQuery = query(
        collection(firestore, "users"),
        where("firstNameParent", "==", globalSearch.value),
        // ***problem when try search in both firstname and last name
        limit(10)
      );

      const querySnapshot = await getDocs(searchFriendQuery);
      let resultFirstName;
      const searchResult = await querySnapshot.forEach((key) => {
        console.log(key.id);
        resultFirstName = key.data().firstNameParent;
        let resultLastName = key.data().lastNameParent;
        let profilePic = key.data().profileImgParent;
        console.log(resultFirstName, resultLastName, profilePic);
        showSearchFriendToOutput(resultFirstName, resultLastName, profilePic);
        // change to push to array and showSearchFriendToOutput from that array in case more than 1 user with same name
      });

      if (resultFirstName === undefined) {
        console.log(`no user with this name, try again`);
        showSearchFriendToOutput(null, null, null);
      }

      // config the database to only allow searchForFriend when user logged in already.
    }
  } catch (error) {
    console.log(error);
  }
}

globalSearch.addEventListener("keydown", searchForFriend);

function showSearchFriendToOutput(resultName, resultLastName, profilePic) {
  while (searchOutput.firstChild) {
    searchOutput.removeChild(searchOutput.firstChild);
  }
  if (resultName == null) {
    searchOutput.classList.toggle("searchOutput");
    let emptySearchDiv = document.createElement("div");
    emptySearchDiv.setAttribute("class", "emptySearchDiv");
    emptySearchDiv.setAttribute("id", "emptySearchDiv");
    // searchOutput.insertBefore(searchDiv,searchOutput.firstChild);
    searchOutput.appendChild(emptySearchDiv);
    let searchHeadline = document.createElement("h2");
    searchHeadline.innerHTML = "Search results";
    let createNewParagraph = document.createElement("p");
    createNewParagraph.setAttribute(`id`, `searchResult`);
    createNewParagraph.innerHTML = `no user with this name, try again`;

    emptySearchDiv.appendChild(searchHeadline);
    emptySearchDiv.appendChild(createNewParagraph);
  } else {
    searchOutput.classList.toggle("searchOutput");
    let searchHeadline = document.createElement("h2");
    searchHeadline.innerHTML = "Search results";
    let closeBtn = document.createElement("a");
    closeBtn.setAttribute("id", "closeBtn");
    closeBtn.setAttribute("class", "closeBtn");
    closeBtn.innerHTML = "x";
    searchHeadline.appendChild(closeBtn);
    let searchCardWrap = document.createElement("div");
    searchCardWrap.setAttribute("class", "searchCardWrap");
    searchCardWrap.setAttribute("id", "searchCardWrap");
    searchOutput.appendChild(searchHeadline);
    searchOutput.appendChild(searchCardWrap);

    let searchCard = document.createElement("div");
    searchCard.setAttribute("class", "searchCard");
    searchCard.setAttribute("id", "searchCard");
    // searchOutput.insertBefore(searchDiv,searchOutput.firstChild);
    searchCardWrap.appendChild(searchCard);

    let createNewParagraph = document.createElement("p");
    createNewParagraph.setAttribute(`id`, `searchResultFirstName`);
    createNewParagraph.innerHTML = resultName;
    let createLastNameParagraph = document.createElement("p");
    createLastNameParagraph.setAttribute(`id`, `searchResultLastName`);
    createLastNameParagraph.innerHTML = resultLastName;
    let createProfilePicWrap = document.createElement("div");
    let createProfilePic = document.createElement("img");
    createProfilePic.setAttribute(`src`, profilePic);
    createProfilePicWrap.appendChild(createProfilePic)
    let addFriendButton = document.createElement("button");
    addFriendButton.setAttribute(`id`, `sendFriendRequestBtn`);
    addFriendButton.setAttribute(`class`, `sendFriendRequestBtn`);
    addFriendButton.setAttribute(`type`, `button`);
    // addFriendButton.setAttribute(`onclick`, `sendFriendRequest()`);

    // ** add condition to check if user already 1. requested >>then show button as wait for response 2. already friend>> no button, change the name to link to profile

    addFriendButton.innerHTML = "Send friend request";
    //will cause an error when search result showing more than 1 since ID will duplicate

    searchCard.appendChild(createNewParagraph);
    searchCard.appendChild(createLastNameParagraph);
    searchCard.appendChild(createProfilePicWrap);
    searchCard.appendChild(addFriendButton);
  }

  function closeSearchOutput() {
    searchOutput.classList.toggle("searchOutput");
  }

  closeBtn.addEventListener("click", closeSearchOutput);

  async function sendFriendRequest() {
    console.log(`sendFriendRequest is called`);
    // search for this user in database collection>document
    try {
      // =====new version==========================================================

      // *********** change this data *****************

      let targetedUser = searchResultFirstName.innerHTML;
      const searchFriendQuery = await query(
        collection(firestore, "users"),
        where("firstNameParent", "==", targetedUser),
        // where("lastNameParent", "==", targetedUser),
        // **add feature to fileter by request status, if friend request already sent, show as requested. if you already friend, show as friend and checkmark.
        // ***add ability to search for both firstname or lastname
        limit(1)
      );

      // *in case of their is multiple user with same name >> increase limit of result>>put result in array>>loop and show to display
      const querySnapshot = await getDocs(searchFriendQuery);
      let userID;
      const docURL = await querySnapshot.forEach((key) => {
        userID = key.id;
      });
      // console.log(userID)

      const currentUser = auth.currentUser;
      const friendRequestSentField = {
        requestStatus: true,
        friendRequestFromUid: `${currentUser.uid}`,
        friendRequestFromEmail: `${currentUser.email}`,
        friendRequestFromFirstNameParent: `${userFirstNameParent}`,
        friendRequestFromLastNameParent: `${userLastNameParent}`,
        friendRequestFromProfileImgParent: `${userprofileImgParent}`,
        // above is worked because it pull data from auth>>below is undefined because it need to pull data from user database not auth
        // friendRequestFromFirstName: `${currentUser.firstNameParent}`,
        // friendRequestFromLastName: `${currentUser.lastNameParent}`,
        // friendRequestFromProfileImgParent: `${currentUser.profileImgParent}`,
      };

      const targetedDoc = doc(
        firestore,
        `users/${userID}/friend_request/${currentUser.uid}`
      );
      await setDoc(targetedDoc, friendRequestSentField);
      
      // Create a notification for targeted user
      const friendRequestNotif = await createFriendRequestNotification(currentUser.uid, userID);

      sendFriendRequestBtn.innerHTML = "Sent!";
      sendFriendRequestBtn.style.color = "green";
      setTimeout(() => {
        // output.removeChild(createNewParagraph);
        searchCard.removeChild(sendFriendRequestBtn);
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  }
  // ***It will crash after second user try to add friend with this person since updateDoc will only uddate laest request

sendFriendRequestBtn.addEventListener("click", sendFriendRequest);
}
const cities = [];
function testOnsnapshot() {
  const q = query(
    collection(firestore, "users"),
    where("parentScore", "==", 5),
    limit(5)
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    
    querySnapshot.forEach((doc) => {
      cities.push(doc.data().firstNameParent);
    });
    console.log("Current cities in CA: ", cities.join(", "));
  });
  // [END listen_multiple_modular]
}
testOnsnapshot()


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


// Notification
function verifyNotificationsParameters() {
  const url = new URL(window.location.href);
  console.log(url)
  const hashedURL = url.hash.substring(1);
  console.log(hashedURL)
  const params = new URLSearchParams(hashedURL);
  console.log(params)
  const notif = params.get('n');
  console.log(notif)
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
    console.log('noti is read')  
    await updateNotificationAsRead(notifParam);
      acceptedHeader.dispatchEvent(new Event("click"));
  }
  // pendingHeader.dispatchEvent(new Event("click"));
}

initializePage();


addMoreKid.addEventListener('click',()=>{
  window.location.href ="/messages"
})