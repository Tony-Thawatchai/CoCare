import { getFirebase, requestPushNotification, queryNotification, getUserProfile } from "./firebase-disable.js";

// Initialize variables to be used in this module =============================
// Firebase Variables
const { auth } = getFirebase();
auth.onAuthStateChanged(async (user) => {
    if (user) {
        navLoginUser.classList.toggle("nav-login-user-active");
        navNonLoginUser.classList.toggle("nav-non-login-user-active");
        secondaryMenu.classList.toggle("secondary-menu-active");
        userProfileMenu.classList.toggle("user-profile-active");
        menuItemHome.classList.toggle("menu-item-active");

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


// Local Variables ============================================================
const notifications = [];
let notificationUnsub = null;

// HTML Elements ==============================================================
const list_notifications = document.querySelector('#list-notification');
const enable_push_notif = document.querySelector('#enable-notif');

// ============================================================================

// Event Listeners ============================================================
enable_push_notif.addEventListener('click', (evt) => {
    try {
        if(requestPushNotification()) {
            enable_push_notif.disabled = true;
        }else {
            enable_push_notif.disabled = false;
        };
    }catch(err){
        console.log(err);
    }
});



// Functions ==================================================================
// Display Notifications when called
function displayNotifications() {
    list_notifications.innerHTML = '';
    if(notifications.length > 0) {
        notifications.forEach((item) => {
            let list_item = '';
            list_item += `<li class="list-item-notification">`;
                list_item += `<h3 class="notification-item-header">${item.notification_header}</h3>`;
                list_item += `<p class="notification-item-body">${item.notification_body}</p>`;
                if( item.notification_url ) {
                    list_item += `<a href="${item.notification_url}" class="notification-item-link">View</a>`;
                }
            list_item += `</li>`;
            list_notifications.innerHTML += list_item;
        });
    }else {
        list_notifications.innerHTML = '<li class="list-item">No Notifications</li>';
    }
}

async function initializeNotifications() {
    //Query User for notification_token, if not found, request permission
    if(requestPushNotification()) {
        enable_push_notif.disabled = true;
    }else {
        enable_push_notif.disabled = false;
    }
    // Initialize notification at page load and keep it updated on new notifications
    notificationUnsub = queryNotification(notifications, displayNotifications);
}
initializeNotifications();

// Unload Notifications onSnapshot on page unload
window.addEventListener('unload', (evt) => {
    if(notificationUnsub) {
        notificationUnsub();
    }
    evt.returnValue = '';
});