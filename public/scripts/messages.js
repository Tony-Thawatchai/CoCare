import { getFirebase, onAuth, getConversationList, getConversationWith, getUserProfile, getMessages, sendMessage } from './firebase-disable.js';
// import { Conversation } from './classes/conversation.js';
import { collection, query, getDocs, getDoc, doc, where, orderBy, onSnapshot, addDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { User } from './classes/user.js';

const userList = new Map();
const userMessages = [];
let conversations = [];
let userId = '';
let currentConversationID = '';
let currentConversationWith = '';
let currentConversationUnsub = '';

const { auth } = getFirebase();
// Verify user is logged in and initialize "secondary menu"
auth.onAuthStateChanged(async (user) => {
    if (user) {
        navLoginUser.classList.toggle("nav-login-user-active");
        navNonLoginUser.classList.toggle("nav-non-login-user-active");
        secondaryMenu.classList.toggle("secondary-menu-active");
        userProfileMenu.classList.toggle("user-profile-active");
        menuItemNotification.classList.toggle("menu-item-active");

        // Get User Profile
        const user_profile = await getUserProfile(user.uid);
        // Set user user details
        const profile_pic = document.querySelector('#userProfilePicMenu');
        profile_pic.src = user_profile.profileImgParent;
        const first_name = document.querySelector('#userFirstNameMenu');
        first_name.innerHTML = user_profile.firstNameParent;
        const last_name = document.querySelector('#userLastNameMenu');
        last_name.innerHTML = user_profile.lastNameParent;
        const header_name = document.querySelector('#welcomeUserName');
        header_name.innerHTML = user_profile.firstNameParent;
    } else {
        console.log(`User is not logged in`);
        window.location = "/";
    }
});

// // Get the user ID from the URL query string and save it to a variable
// const params = new URLSearchParams(window.location.search);
// const paramID = params.get('u');
const rawConversationList = [];
const conversationList = [];
let conversation_unsubscribe = null;

// async function initializeMessages() {
//     conversation_unsubscribe = await getConversationList(rawConversationList, createConversationList);
//     const userParamID = verifyParamID();
//     if(userParamID) {
//         setupChatHeader(userParamID);
//     }else {
//         // Display the first conversation in the list = TODO
//         // For now, just display a blank chat window and wait for the user to click on a conversation
//     }
// }

// async function createConversationList() {
//     const userID = auth.currentUser.uid;
//     conversationList.length = 0;
//     for( let conversation of rawConversationList ) {
//         // Remove the user from the conversation.members array
//         if(conversation.members && Array.isArray(conversation.members)) {
//             const index = conversation.members.indexOf(userID);
//             if(index > -1) {
//                 conversation.members.splice(index, 1);
//             }
//         }
//         // Get the other member profile;
//         const otherMember = await getUserProfile(conversation.members[0]);
//         // Create a new conversation object
//         const newConversation = new Conversation(
//             conversation.id,
//             `${otherMember.firstNameParent} ${otherMember.lastNameParent}`,
//             conversation.last_message,
//             otherMember.profileImgParent
//         );
//         conversationList.push(newConversation);
//     }
//     displayConversationList();
// }

// function displayConversationList() {
//     const conversation_list = document.querySelector('#users-list');
//     conversation_list.innerHTML = '';
//     for(let convo of conversationList) {
//         let item = '';
//         item += `<li class="users-list-item" id="${convo.conversationID}">`;
//             item += `<div class="user-avatar">`;
//             // Verify if the user has a profile pic, if not, use a placeholder
//                 if(convo.profile_pic == undefined && convo.profile_pic == '' || convo.profile_pic == null) {
//                     item += `<img src="https://picsum.photos/200" alt="Profile Pic">`;
//                 }
//                 item += `<img src="${convo.profile_pic}" alt="Profile Pic">`;
//             item += `</div>`;
//             item += `<div class="user-info">`;
//                 item += `<p class="user-info-name">${convo.name}</p>`;
//                 item += `<p class="user-info-status">${convo.last_message.body}</p>`;
//             item += `</div>`;
//         item += `</li>`;
//         conversation_list.innerHTML += item;
//     }
// }

// function verifyParamID() {
//     const params = new URLSearchParams(window.location.search);
//     const uid = params.get('u');
//     if( uid === null || uid === undefined || uid === "" ) {
//         console.log(`No user id provided`);
//         return null;
//     }
//     return uid;
// }

// async function setupChatHeader( uid ) {
//     const user = await getUserProfile(uid);
//     const messages_header = document.querySelector('.messages-wrapper-user-avatar');
//     let item = '';
//     if(user.profileImgParent == undefined && user.profileImgParent == '' || user.profileImgParent == null) {
//         item += `<img src="https://picsum.photos/200" alt="Profile Pic">`;
//     }else {
//         item += `<img src="${user.profileImgParent}" alt="Profile Pic">`;
//     }
//     item += `<h2>${user.firstNameParent} ${user.lastNameParent}</h2>`;
//     messages_header.innerHTML = item;
// }

// initializeMessages();

window.addEventListener('unload', (evt) => {
    if(conversation_unsubscribe && typeof conversation_unsubscribe === 'function') {
        conversation_unsubscribe();
    }
    evt.returnValue = '';
});

let currentUser = null;
let currentConversationWithUser = null;
let currentConversationDocID = null;

async function initializeMessages() {
    // if paramID is not null, query the database to show conversation with that user
    getConvos(auth.currentUser.uid);
    // if(paramID !== null) {
    //     try {
    //         // Query the database to update currentConversationWithUser variable to the user object of the user we are messaging
    //         currentUser = await auth.currentUser;
    //         currentConversationWithUser = await getUserProfile(paramID);
    //         currentConversationDocID = await getConversationWith(currentUser.uid, paramID);
    //         console.log(currentConversationDocID);
    //         messageHeader( currentConversationWithUser );
    //         // If conversation exists, display it, if not, show an empty conversation
    //         if ( currentConversationDocID.length === 0 ) {
    //             console.log(`Conversation does not exist`);
    //             currentConversationID = null;
    //             const message_area = document.querySelector('.messages-area');
    //             message_area.innerHTML = ''; // Reset Message Area
    //         } else {
    //             console.log(`Conversation exists`);
    //             currentConversationID = currentConversationDocID[0].id;
    //             currentConversationUnsub = await getMessages(currentConversationID, userMessages, displayMessages);
    //         }
    //     } catch(err) {
    //         console.log(err);
    //     }
    // }
}

function messageHeader( user ) {
    console.log(user);
    const messages_wrapper_user_avatar = document.querySelector('.messages-wrapper-user-avatar');
    messages_wrapper_user_avatar.innerHTML = '';
    let item = '';
    item += `<img src="${user.profileImgParent}" alt="Profile Pic">`;
    item += `<h2>${user.firstNameParent} ${user.lastNameParent}</h2>`
    messages_wrapper_user_avatar.innerHTML += item;
}

initializeMessages();



// Temporary Functions to be replaced with more optimized functions

function displayMessages() {
    const message_area = document.querySelector('.messages-area');
    message_area.innerHTML = ''; // Reset Message Area
    let item = '';
    for(let message of userMessages) {
        if(message.sender_uid === userId) {
            item += `<li class="message message-mine">`;
        }else {
            item += `<li class="message">`;
        }
            item += '<div class="message-content">';
                item += `<div class="message-text">${message.message_body}</div>`;
                item += `<div class="message-time">${new Date(message.timestamp.seconds).toLocaleTimeString()}</div>`;
            item += '</div>';
        item += '</li>';
    }
    message_area.innerHTML += item;
}

function verifyID() {
    const user_list_item = document.querySelectorAll('.users-list-item');
    user_list_item.forEach(item => {
        item.addEventListener('click', async () => {
            const user_name = document.querySelector(`#${item.id} .user-name`);
            currentConversationID = item.id;
            currentConversationWith = user_name.id;
            displayMessageHeader(user_name.id);
            await getMessage(item.id);
        });
    });
}

async function displayConversations() {
    const user_msg_list_container = document.querySelector('#users-list');
    user_msg_list_container.innerHTML = ''; // Clear List
    let item = '';
    // Get User Info and save it to userList;
    for(let conversation of conversations) {
        let memberList = conversation.members;
        for(let member of memberList) {
            try {
                let user = await getUserInfo(member);
            }catch(err){
                console.log('Error fetching user data...', err);
            }
        }

        let user_name = conversation.members[0] === userId ? conversation.members[1]: conversation.members[0];

        item += `<li class="users-list-item" id="${conversation.id}">`;
            item += '<div class="user-avatar">';
                item += `<img src="${userList.get(user_name).profile_pic}" alt="Profile Pic">`;
            item += '</div>'
            item += '<div class="user-info">';
                item += `<div class="user-name" id="${userList.get(user_name).uid}">${userList.get(user_name).getFullName()}</div>`;
                item += `<div class="user-last-message">${conversation.last_message.body}</div>`;
            item += '</div>';
        item += '</li>';
    }
    user_msg_list_container.innerHTML += item;
    verifyID();
}

function displayMessageHeader(uid) {
    const messages_wrapper_user_avatar = document.querySelector('.messages-wrapper-user-avatar');
    messages_wrapper_user_avatar.innerHTML = '';
    let item = '';
    item += `<img src="${userList.get(uid).profile_pic}" alt="Profile Pic">`;
    item += `<h2>${userList.get(uid).getFullName()}</h2>`
    messages_wrapper_user_avatar.innerHTML += item;
}

async function getMessage(conversationID) {
    const { firestore } = getFirebase();
    try {
        const message_ref = await collection(firestore, 'messages', conversationID, 'text');
        const q = await query(message_ref, orderBy("timestamp", "asc"));
        currentConversationUnsub = await onSnapshot(q, (querySnapshot) => {
            userMessages.splice(0, userMessages.length) // Clear List
            querySnapshot.forEach((doc) => {
                userMessages.push({id: doc.id, ...doc.data()});
                displayMessages();
            });
        });
        displayMessages();
    }catch (err) {
        console.log(err);
    }
}

async function getConvos() {
    const { firestore } = getFirebase();
    conversations = []; // Clear List
    // Fetch UserID from Auth
    await onAuth(async user => {
        if(user) {
            // const collRef = collection(firestore, `user_messages/${user.uid}/users`);
            userId = user.uid;
            const conversation_ref = await collection(firestore, 'conversations');
            const q = await query(conversation_ref,
                where('members', 'array-contains', user.uid),
                orderBy("last_message.timestamp", "desc")
            );
            try {
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    conversations.push({id: doc.id, ...doc.data()});
                });
                displayConversations();
            }catch (err) {
                console.log(err);
            }
        }else {
        console.log(`No user logged in`);
        }
    });
}

async function getUserInfo(uid) {
    const { firestore } = getFirebase();
    try {
        const user_ref = await doc(firestore, 'users', uid)
        const user_snap = await getDoc(user_ref, uid);
        if(user_snap) {
            if(!userList.has(uid)) {
                const person = new User(uid, user_snap.data().firstNameParent, user_snap.data().lastNameParent, user_snap.data().email, user_snap.data().profileImgParent);
                userList.set(uid, person);
            }
            return true;
        }
    }catch(err) {
        console.log(`Error Fetching Document: ${err}`);
        return false;
    }
}

// Form Submit event listener
const message_form = document.querySelector('#message-form');
message_form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const { firestore } = getFirebase();
    let message_text = document.querySelector('#message-input');
    evt.preventDefault();
    if(message_text.value !== '') {
        const message = await addDoc(collection(firestore, "messages", currentConversationID, "text"),{
            message_body: `${message_text.value}`,
            sender_uid: `${userId}`,
            timestamp: Timestamp.now()
        });
        console.log(`Message added to Database successfully for user ${currentConversationWith}`,message);
    }else {
        console.log('Message is empty');
    }
    message_text.value = '';
});



//mobile menu
function mobileMenu() {
    desktopMenu.classList.toggle("mobile-menu-active");
  }
  hamburgerBtn.addEventListener("click", mobileMenu);