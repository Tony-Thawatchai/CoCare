// import and initialize **************
import { initialize } from "./firebase.js";
import {
  displayRandomUsers,
  getFirebase,
  queryNotification,
  createFriendRequestNotification,
  getDashboardConversations,
  getUserProfile,
} from "./firebase-disable.js";

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

let notification_unsubscribe = null;
let messages_unsubscribe = null;

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
  scoreOutput.appendChild(createScoreText);
  scoreOutput.appendChild(createScoreImg);

  welcomeUserName.innerHTML = userFirstNameParent;
  userProfilePicMenu.setAttribute("src", userprofileImgParent);
  userFirstNameMenu.innerHTML = userFirstNameParent;
  userLastNameMenu.innerHTML = userLastNameParent;
}

// LOGOUT========
async function logout() {
  await signOut(auth);
  window.location.href = "/";
  //   clearAuthStateToOutput();
}

// search for friend & send friend request =================

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
    let closeBtnNoResult = document.createElement("a");
    closeBtnNoResult.setAttribute("id", "closeBtnNoResult");
    closeBtnNoResult.setAttribute("class", "closeBtnNoResult");
    closeBtnNoResult.innerHTML = "x";
    searchHeadline.appendChild(closeBtnNoResult);
    closeBtnNoResult.addEventListener("click", closeSearchOutput);


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
    let profilePicWrap = document.createElement('div');
    profilePicWrap.setAttribute('class','searchProfilePicWrap')
    let createProfilePic = document.createElement("img");
    createProfilePic.setAttribute(`src`, profilePic);
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
    profilePicWrap.appendChild(createProfilePic);
    searchCard.appendChild(profilePicWrap);
    searchCard.appendChild(addFriendButton);
    closeBtn.addEventListener("click", closeSearchOutput);
  }

  function closeSearchOutput() {
    searchOutput.classList.toggle("searchOutput");
  }

  
  

  async function sendFriendRequest() {
    console.log(`sendFriendRequest is called`);
    // search for this user in database collection>document
    try {
      let targetedUser = searchResultFirstName.innerHTML;
      console.log(targetedUser);

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
      console.log(querySnapshot);
      let userID;
      const docURL = await querySnapshot.forEach((key) => {
        userID = key.id;
        console.log(`key.id`);
        console.log(key.id);
      });
      // console.log(userID)

      const currentUser = auth.currentUser;
      console.log(currentUser);
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

      // create notification for friend request accepted
      const friendAccept = await createFriendRequestNotification(
        currentUser.uid,
        userID
      );

      sendFriendRequestBtn.innerHTML = "Sent!";
      // sendFriendRequestBtn.style.color = "white";
      sendFriendRequestBtn.style.backgroundColor = "#0fabdc";
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

// export function goToSearchPage(e) {
//   if (e.key === "Enter") {
//     let searchInquiry;
//     searchInquiry = globalSearch.value;
//     console.log(searchInquiry)

//     location.replace(`search/?q=${searchInquiry}`);
//   }
// }

// globalSearch.addEventListener("keydown", goToSearchPage);
globalSearch.addEventListener("keydown", searchForFriend);

// NAVIGATION=========
let btnLogout = document.getElementById("btnLogout");
btnLogout.addEventListener(`click`, () => {
  console.log("logout");
  logout();
  location.replace("/");
});

// Notification =======================
let notificationUnsub = "";

function displayNotifications(docID, item) {
  const notification_content = document.querySelector(
    "#notification-item-content"
  );
  notification_content.innerHTML = "";
  let content = "";
  content += `<h3 class="notification-item-header">${item.notification_header}</h3>`;
  content += `<p class="notification-item-body">${item.notification_body}</p>`;
  if (item.notification_url !== "profile#") {
    content += `<a href="${item.notification_url}&n=true&d=${docID}" class="notification-item-link">View</a>`;
  } else if (item.notification_url == "/profile#") {
    content += `<a href="${item.notification_url}" class="notification-item-link">View</a>`;
  }

  const notification_flag = document.querySelector("#notification-count");
  notification_flag.classList.add("notification-count-active");
  notification_flag.innerHTML = "!";
  notification_content.innerHTML += content;
  return;
}

async function getNotifications() {
  const { auth } = getFirebase();
  try {
    const notif_ref = await collection(
      firestore,
      "notifications",
      auth.currentUser.uid,
      "notifs"
    );
    const q = await query(
      notif_ref,
      where("notification_flag", "==", false),
      orderBy("notification_timestamp", "desc"),
      limit(1)
    );
    notificationUnsub = await onSnapshot(q, (querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        if (
          change.type === "added" ||
          change.type === "modified" ||
          change.type === "removed"
        ) {
          displayNotifications(change.doc.id, change.doc.data());
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
}

async function initializeDashboard() {
  const parentSuggestion = await displayRandomUsers(3);
  displayParentSuggestion(parentSuggestion);
  notification_unsubscribe = await getNotifications();
  const conversations = await getDashboardConversations();
  displayConversations(conversations);
}

async function displayConversations(conversations) {
  const conversation_list = document.querySelector(
    ".conversation-snapshot-list"
  );
  conversation_list.innerHTML = "";
  let item = "";

  // Check if there are any conversations to display
  if (conversations.length === 0) {
    item += `<li class="conversation-snapshot-list-item">`;
    item += `<h3 class="conversation-snapshot-list-item-header">No Conversations</h3>`;
    item += `</li>`;
  } else {
    // Loop through conversations and display them
    for (let conversation of conversations) {
      const partnerID =
        conversation.members[0] === auth.currentUser.uid
          ? conversation.members[1]
          : conversation.members[0];
      const partner = await getUserProfile(partnerID);
      const latestMessage = conversation.last_message.body;

      item += `<li class="conversation-snapshot-list-item">`;
      item += `<div class="conversation-snapshot-list-item-pic">`;
      item += `<img src="${partner.profileImgParent}" alt="conversation-snapshot-pic">`;
      item += `</div>`;
      item += `<div class="conversation-snapshot-list-item-content">`;
      item += `<a href="/messages?c=${conversation.id}">`;
      item += `<h3 class="conversation-snapshot-list-item-content-name">${partner.firstNameParent} ${partner.lastNameParent}</h3>`;
      item += `<p class="conversation-snapshot-list-item-content-message">${latestMessage}</p>`;
      item += `</a>`;
      item += `</div>`;
      item += `</li>`;
    }
  }

  conversation_list.innerHTML += item;
}

function displayParentSuggestion(parentSuggestion) {
  const parent_suggestion_list = document.querySelector(
    ".parent-suggestion-list"
  );
  const parentSuggestionListWrap = document.getElementById('parentSuggestionListWrap')
  console.log (parentSuggestionListWrap)
  // Reset parent suggestion section

  parent_suggestion_list.innerHTML = "";
  console.log(parentSuggestion);

  if (parentSuggestion === 0) {
    console.log ('no parent match')
    let listItem = document.createElement('div') 
    listItem.setAttribute('class',"suggestion-snapshot-list-item")
    let item = document.createElement('h3') 
    item.innerHTML = "No parent from the same school. Try search by name";
    listItem.appendChild(item)
    
    parentSuggestionListWrap.removeChild(parent_suggestion_list)
    parentSuggestionListWrap.appendChild(listItem)
  } else {
    parentSuggestion.forEach((parent) => {
      let item = "";
      item += `<li class="parent-suggestion-list-item">`;
      item += `<div class="parent-suggestion-list-item-pic">`;
      item += `<img src="${parent.profileImgParent}" alt="parent-suggestion-pic">`;
      item += `</div>`;
      item += `<div class="parent-suggestion-list-item-content">`;
      item += `<a href="/profiles?u=${parent.uid}"><h3 class="parent-suggestion-list-item-content-name">${parent.firstNameParent} ${parent.lastNameParent}</h3></a>`;
      item += `</div>`;
      item += `<button class="parent-suggestion-list-item-btn" id='${parent.uid}'>Send friend request</button>`;

      item += `</li>`;
      parent_suggestion_list.innerHTML += item;
    });
  }

  parentSuggestionSendFriendRequest();
}

function parentSuggestionSendFriendRequest() {
  let allButton = document.querySelectorAll(".parent-suggestion-list-item-btn");
  console.log(allButton);
  allButton.forEach((button) => {
    button.addEventListener("click", suggestionSendFriendRequest);
  });
}

async function suggestionSendFriendRequest() {
  console.log(`suggestionSendFriendRequest is called`);
  console.log(this.id);
  // search for this user in database collection>document
  try {
    let targetedUser = this.id;
    console.log(targetedUser);

    const searchFriendQuery = await query(
      collection(firestore, "users"),
      where("uid", "==", targetedUser),

      // where("lastNameParent", "==", targetedUser),
      // **add feature to fileter by request status, if friend request already sent, show as requested. if you already friend, show as friend and checkmark.
      // ***add ability to search for both firstname or lastname
      limit(1)
    );

    // *in case of their is multiple user with same name >> increase limit of result>>put result in array>>loop and show to display
    const querySnapshot = await getDocs(searchFriendQuery);
    console.log(querySnapshot);
    let userID;
    const docURL = await querySnapshot.forEach((key) => {
      userID = key.id;
      console.log(`key.id`);
      console.log(key.id);
    });
    // console.log(userID)

    const currentUser = auth.currentUser;
    console.log(currentUser);
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

    // create notification for friend request accepted
    const friendAccept = await createFriendRequestNotification(
      currentUser.uid,
      userID
    );

    this.innerHTML = "Sent!";
    // sendFriendRequestBtn.style.color = "white";
    this.style.backgroundColor = "#0fabdc";
    // setTimeout(() => {
    //   // output.removeChild(createNewParagraph);
    //   searchCard.removeChild(sendFriendRequestBtn);
    // }, 2000);
  } catch (error) {
    console.log(error);
  }
}

initializeDashboard();

// Unload onSnapshots on page unload
window.addEventListener("unload", (evt) => {
  if (notification_unsubscribe) {
    notification_unsubscribe();
  }

  if (messages_unsubscribe) {
    messages_unsubscribe();
  }
  evt.returnValue = "";
});

//mobile menu
function mobileMenu() {
  desktopMenu.classList.toggle("mobile-menu-active");
}
hamburgerBtn.addEventListener("click", mobileMenu);
