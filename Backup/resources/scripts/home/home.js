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
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

const { auth } = initialize();
const { firestore } = initialize();

// add onAuthStateChanged

onAuthStateChanged(auth, async function (user) {
  if (user) {
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

  const activeUserQuery = query(
    collection(firestore, "users"),
    where("email", "==", user.email),
    limit(1)
  );

  const querySnapshot = await getDocs(activeUserQuery);

  querySnapshot.forEach((key) => {
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
    getRequestsForUser(user.uid);
  } else {
    let notLoggedInMessage = ` you're not logged in.`;
    //   console.log(notLoggedInMessage);
    showAuthStateToOutput(notLoggedInMessage);
  }
}

function showAuthStateToOutput(userEmail, parentScore) {
  let createUserParagraph = document.createElement("p");
  createUserParagraph.innerHTML = "Hi! ";
  createUserParagraph.innerHTML += `"`;
  createUserParagraph.innerHTML += userEmail;
  createUserParagraph.innerHTML += `"`;
  let createScoreParagraph = document.createElement("p");
  createScoreParagraph.innerHTML = "Parent score =";
  createScoreParagraph.innerHTML += parentScore;
  let createProfilePic = document.createElement("img");
  createProfilePic.setAttribute('src',userprofileImgParent)
  
  output.appendChild(createUserParagraph);
  output.appendChild(createScoreParagraph);
  output.appendChild(createProfilePic);
}

// LOGOUT========
async function logout() {
  await signOut(auth);
  clearAuthStateToOutput();
}

// search for friend & send friend request =================
async function searchForFriend() {
  try {
    const searchFriendQuery = query(
      collection(firestore, "users"),
      where("firstNameParent", "==", searchInput.value),
      // where("lastNameParent", "==", searchInput.value),
      // ***problem when try search in both firstname and last name
      limit(1)
    );

    const querySnapshot = await getDocs(searchFriendQuery);
    const searchResult = await querySnapshot.forEach((key) => {
      console.log(key.id);
      let resultFirstName = key.data().firstNameParent;
      let resultLastName =  key.data().lastNameParent;
      let profilePic = key.data().profileImgParent;
      // result += key.data().lastNameParent;
      showSearchFriendToOutput(resultFirstName,resultLastName,profilePic);
    });

    // fixed issue when there is no user in database with that email
    // config the database to only allow searchForFriend when user logged in already.
  } catch (error) {
    console.log(error);
  }
}

function showSearchFriendToOutput(resultName,resultLastName,profilePic) {
  let searchHeadline = document.createElement("p");
  searchHeadline.innerHTML = "Search results =";
  let createNewParagraph = document.createElement("p");
  createNewParagraph.setAttribute(`id`, `searchResult`);
  createNewParagraph.innerHTML = resultName;
  let createLastNameParagraph = document.createElement("p");
  createLastNameParagraph.setAttribute(`id`, `searchResultLastName`);
  createLastNameParagraph.innerHTML = resultLastName;
  let createProfilePic = document.createElement("img");
  createProfilePic.setAttribute(`src`, profilePic);
  let addFriendButton = document.createElement("button");
  addFriendButton.setAttribute(`id`, `sendFriendRequestBtn`);
  addFriendButton.setAttribute(`type`, `button`);
  // addFriendButton.setAttribute(`onclick`, `sendFriendRequest()`);

  // ** add condition to check if user already 1. requested >>then show button as wait for response 2. already friend>> no button, change the name to link to profile

  addFriendButton.innerHTML = "Send friend request";
  //will cause an error when search result showing more than 1 since ID will duplicate

  output.appendChild(searchHeadline);
  output.appendChild(createNewParagraph);
  output.appendChild(createProfilePic);
  output.appendChild(addFriendButton);

  async function sendFriendRequest() {
    console.log(`sendFriendRequest is called`);
    // search for this user in database collection>document
    try {
      // =====new version==========================================================
      let targetedUser = searchResult.innerHTML;
      console.log(targetedUser);

      const searchFriendQuery = await query(
        collection(firestore, "users"),
        where("firstNameParent", "==", targetedUser),
        //*****now it retrieve search parameter from search box which can cause problem in the future where some  user may have a duplicate name */
        // where("lastNameParent", "==", targetedUser),

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
      addFriendButton.innerHTML = "Sent!";
      addFriendButton.style.color = "green";
      setTimeout(() => {
        output.removeChild(createNewParagraph);
        output.removeChild(addFriendButton);
      }, 2000);

      
    } catch (error) {
      console.log(error);
    }
  }
  // ***It will crash after second user try to add friend with this person since updateDoc will only uddate laest request

  sendFriendRequestBtn.addEventListener("click", sendFriendRequest);
}

submitBtnSearch.addEventListener("click", searchForFriend);

//accepting friend request

// after click "friend list"

// >> loop through "friend_request" in database to display pending request
// >>>>>> show "accept" and "decline" button
// >>>>>>>>>>>> if accept update database by delete the pending request in friend_request and add document in friend_list with data 1. username 2. profilePic 3. timestamp and ask user to set this friend as authorize person with school and update database field
// >>>>>>>>>>>> if decline, delete request in database
// >> loop through "friend_list" in database to display existing friends with chat button and link to see full profile

let friendRequestTrue = [];
async function acceptFriend(e) {
  try{

    console.log(e);
    let acceptedUid = friendRequestTrue[e].objectUID;
  
    const updateRequestStatus = {
      requestStatus: false,
    };
  
    const requestedDoc = doc(
      firestore,
      `users/${activeUserDocId}/friend_request/${acceptedUid}`
    );
    await updateDoc(requestedDoc, updateRequestStatus);
  
  
    // query for added user in database>send that data to friends subcollection
    
    const searchFriendQuery = query(
      collection(firestore, "users"),
      where("uid", "==", acceptedUid),
      limit(1)
    );

    const querySnapshot = await getDocs(searchFriendQuery);
    let addedFriend = null  ;
    const searchResult = await querySnapshot.forEach((key) => {
      
      addedFriend = {
        FriendUID: key.data().uid,
        friendStatus: true,
        friendFirstName: key.data().firstNameParent,
        friendLastName : key.data().lastNameParent,
        friendProfileImgParent : key.data().profileImgParent,
        friendSchoolAuthorized : null
      };
    });

    const friendsDoc = doc(
      firestore,
      `users/${activeUserDocId}/friends/${acceptedUid}`
    );
  
    await setDoc(friendsDoc, addedFriend);
  
    // change friend_request/UID/requestStatus:false
    //write new document in friend subcollection

    // Tony please also add the user, who accepted request to friends list of the requester (Genia)
  } catch(error){
    console.log(error)
  }
  
}

let allAcceptButton = [];
let friendListArray=[];
async function showFriendList() {
  try {
    console.log(`showFriendList is called`);
    // getting path to current user document
    console.log(`activeUserDocId=` + activeUserDocId);
    const searchFriendRequestQuery = query(
      collection(firestore, `users/${activeUserDocId}/friend_request`),
      where("requestStatus", "==", true),
      limit(10)
    );

    const querySnapshot = await getDocs(searchFriendRequestQuery);

    const searchResult = await querySnapshot.forEach((key) => {
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

    function drawFriendRequestList() {
      let friendRequestHeadline = document.createElement("div");
      friendRequestHeadline.setAttribute(`id`, `friendRequestHeadline`);
      friendRequestHeadline.innerHTML = "Friend request =";
      output.appendChild(friendRequestHeadline);

      for (let i = 0; i < friendRequestTrue.length; i++) {
        let createNewParagraph = document.createElement("p");
        createNewParagraph.setAttribute(`id`, `friendRequestResult`);
        createNewParagraph.innerHTML = friendRequestTrue[i].objectName;
        console.log(friendRequestTrue[i].objectProfilePic )
        let createFriendRequestProfilePic = document.createElement("img");
        createFriendRequestProfilePic.setAttribute(`src`,`${friendRequestTrue[i].objectProfilePic }`);
        
        let acceptFriendBtn = document.createElement("button");
        acceptFriendBtn.setAttribute(`id`, `acceptFriendBtn(${i})`);
        acceptFriendBtn.setAttribute(`class`, `acceptFriendBtn`);
        // acceptFriendBtn.setAttribute(`onclick`, `acceptFriend(${i})`);

        // acceptFriendBtn.onclick = acceptFriend(`${i}`);
        acceptFriendBtn.setAttribute(`type`, `button`);
        acceptFriendBtn.innerHTML = "Accept";

        friendRequestHeadline.appendChild(createNewParagraph);
        friendRequestHeadline.appendChild(createFriendRequestProfilePic);
        friendRequestHeadline.appendChild(acceptFriendBtn);
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
        allAcceptButton[i].style.color = "green";
      setTimeout(() => {
        friendRequestHeadline.removeChild(allAcceptButton[i]);
      }, 2000);
      });
    }
    

    // fixed issue when there is no user in database with that
    // config the database to only allow searchForFriend when user logged in already.
  
    // friend list 

    const searchFriendListQuery = query(
      collection(firestore, `users/${activeUserDocId}/friends`),
      where("friendStatus", "==", true),
      limit(50)
    );

    const friendListQuerySnapshot = await getDocs(searchFriendListQuery);

    const friendListSearchResult = await friendListQuerySnapshot.forEach((key) => {
      let object = {
        objectName: `${key.data().friendFirstName} ${
          key.data().friendLastName
        }`,
        objectUID: key.data().FriendUID,
        objectProfileImg: key.data().friendProfileImgParent,
        objectSchoolAuthorized: key.data().friendSchoolAuthorized,
      };
      friendListArray.push(object);
    });

    function drawFriendList() {
      let friendListHeadline = document.createElement("div");
      friendListHeadline.setAttribute(`id`, `friendListHeadline`);
      friendListHeadline.innerHTML = "Friend =";
      output.appendChild(friendListHeadline);

      // **query using ID to get user first name last name instead of UID

      for (let i = 0; i < friendListArray.length; i++) {
        let createNameParagraph = document.createElement("a");
        // createNameParagraph.setAttribute(`href`, `// *** create a link to profile page with query to UID `);
        createNameParagraph.innerHTML = friendListArray[i].objectName;
        let createProfilePic = document.createElement("img");
        createProfilePic.setAttribute(`src`, `${friendListArray[i].objectProfileImg}`);
        console.log(friendListArray[i].objectProfileImg)
        let createAuthorizedParagraph = document.createElement("p");
        // createAuthorizedParagraph.innerHTML = friendListArray[i].objectSchoolAuthorized;

        // *** create a link to profile page with query to UID 
      

        friendListHeadline.appendChild(createNameParagraph);
        friendListHeadline.appendChild(createProfilePic);
        friendListHeadline.appendChild(createAuthorizedParagraph);
        
      }
    }

    drawFriendList()


  
  
  } catch (error) {
    console.log(error);
  }
}

friendList.addEventListener("click", showFriendList);

// NAVIGATION=========
btnLogout.addEventListener(`click`, () => {
  location.replace("../HTML/login.html");
  logout()
});


// Get requests for user
async function getRequestsForUser(userUid) {
  console.log('getting requests for user', userUid);

  const requestsQuery = query(collection(firestore, "care_request"), where("asker_UUID", "==", userUid));
  const requestsSnapshot = await getDocs(requestsQuery);

  let userRequests = [];
  requestsSnapshot.forEach((requestItem) => {
    userRequests.push(requestItem.data());
  });
  console.log('Requests', userRequests);

  // draw cards for each request
  userRequests.forEach((request) => drawRequectCard(request));
}

function drawRequectCard(request) {
  const requestList = document.querySelector('#request-list');
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('request-card');
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('request-title');
  titleDiv.innerHTML = `Request for ${request.request_type}`;
  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('request-details');
  const dateDiv = document.createElement('div');
  dateDiv.classList.add('care-date');
  const timeDiv = document.createElement('div');
  timeDiv.classList.add('care-time');
  const weekdayDiv = document.createElement('div');
  const timesDiv = document.createElement('div');
  const statusDiv = document.createElement('div');
  statusDiv.classList.add('request-status')

  // format date to 'Feb 02'
  const convertedStartTime = new Date(request.start_time.seconds * 1000)
  const convertedEndTime = new Date(request.end_time.seconds * 1000)
  const dateOptions = { month: 'short', day: 'numeric' };
  const monthAndDay = convertedStartTime.toLocaleDateString('en-us', dateOptions);
  dateDiv.innerHTML = monthAndDay.toUpperCase();
  // format weekday
  const weekdayOptions = { weekday : 'long' };
  const weekday = convertedStartTime.toLocaleDateString('en-us', weekdayOptions);
  weekdayDiv.innerHTML = weekday;
  // format times
  const timeOptions = { hour: 'numeric', minute: 'numeric' };
  const startTime = convertedStartTime.toLocaleTimeString('en-us', timeOptions);
  const endTime = convertedEndTime.toLocaleTimeString('en-us', timeOptions);
  timesDiv.innerHTML = `${startTime} - ${endTime}`;

  // if no status in request, set status to Pending
  if (!request.status) {
    cardDiv.classList.add('pending');
    statusDiv.innerHTML = 'Pending';
  }
  if (request.status === 'accepted') {
    cardDiv.classList.add('accepted');
    statusDiv.innerHTML = 'Accepted';
  }

  requestList.append(cardDiv);
  cardDiv.append(titleDiv);
  cardDiv.append(detailsDiv);
  detailsDiv.append(dateDiv);
  detailsDiv.append(timeDiv);
  timeDiv.append(weekdayDiv);
  timeDiv.append(timesDiv);
  detailsDiv.append(statusDiv);
}


