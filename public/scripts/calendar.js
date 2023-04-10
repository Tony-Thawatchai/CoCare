import { getFirebase, getEvents, getUserProfile } from "./firebase-disable.js";

const { auth } = getFirebase();
// Verify user is logged in and initialize "secondary menu"
auth.onAuthStateChanged(async (user) => {
  if (user) {
    navLoginUser.classList.toggle("nav-login-user-active");
    navNonLoginUser.classList.toggle("nav-non-login-user-active");
    secondaryMenu.classList.toggle("secondary-menu-active");
    userProfileMenu.classList.toggle("user-profile-active");
    menuItemCalendar.classList.toggle("menu-item-active");

    // Get User Profile
    const user_profile = await getUserProfile(user.uid);
    // Set user user details
    const profile_pic = document.querySelector("#userProfilePicMenu");
    profile_pic.src = user_profile.profileImgParent;
    const first_name = document.querySelector("#userFirstNameMenu");
    first_name.innerHTML = user_profile.firstNameParent;
    const last_name = document.querySelector("#userLastNameMenu");
    last_name.innerHTML = user_profile.lastNameParent;
    const header_name = document.querySelector("#welcomeUserName");
    header_name.innerHTML = user_profile.firstNameParent;
  } else {
    console.log(`User is not logged in`);
    window.location = "/";
  }
});

const prev_month_button = document.querySelector(".prev-month-button");
const next_month_button = document.querySelector(".next-month-button");
const calendar_days = document.querySelector(".calendar-days");
const month_header = document.querySelector(".month-header");
const month_string = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let selected_date = new Date();
let selected_year = selected_date.getFullYear();
let selected_month = selected_date.getMonth();

const renderCalendar = () => {
  let first_day = new Date(selected_year, selected_month, 1).getDay();
  let last_date_month = new Date(
    selected_year,
    selected_month + 1,
    0
  ).getDate();
  let last_day_month = new Date(
    selected_year,
    selected_month,
    last_date_month
  ).getDay();
  let last_date_prev_month = new Date(
    selected_year,
    selected_month,
    0
  ).getDate();

  let calendar_item = "";

  for (let x = first_day; x > 0; x--) {
    calendar_item += `<li class="prev-month">${
      last_date_prev_month - x + 1
    }</li>`;
  }

  for (let x = 1; x <= last_date_month; x++) {
    calendar_item += `<li class="current-month" id="${x}">${x}</li>`;
    // render calendar events hint
  }

  for (let x = last_day_month; x < 6; x++) {
    calendar_item += `<li class="next-month">${x - last_day_month + 1}</li>`;
  }
  month_header.innerHTML = `${month_string[selected_month]} ${selected_year}`;
  calendar_days.innerHTML = calendar_item;
};

prev_month_button.addEventListener("click", () => {
  selected_month = selected_month - 1;

  if (selected_month < 0 || selected_month > 11) {
    selected_date = new Date(selected_year, selected_month, 1);
    selected_year = selected_date.getFullYear();
    selected_month = selected_date.getMonth();
  } else {
    selected_date = new Date();
  }
  renderCalendar();
  renderEvents();
});

next_month_button.addEventListener("click", () => {
  selected_month++;

  if (selected_month < 0 || selected_month > 11) {
    selected_date = new Date(selected_year, selected_month, 1);
    selected_year = selected_date.getFullYear();
    selected_month = selected_date.getMonth();
  } else {
    selected_date = new Date();
  }

  renderCalendar();
  renderEvents();
});

async function renderEvents() {
  const event_item_list = document.querySelector(".events-list");
  event_item_list.innerHTML = "";
  const selectedYearMonthEnd = new Date(selected_year, selected_month + 1, 1);
  let eventList = await getEvents(
    new Date(selected_year, selected_month, 1),
    selectedYearMonthEnd
  );
  console.log(eventList);
  for (let items of eventList) {
    let showDateNum = new Date(items.timestamp.toDate()).getDate();
    let currentMonth = document.querySelectorAll(".current-month");
    let showDate = document.getElementById(`${showDateNum}`)
    console.log (showDate)
    showDate.style.color = 'var(--orange)'
    showDate.style.backgroundColor = 'white'
    showDate.style.borderRadius = '5px'
    showDate.style.fontWeight = 'bold'
    console.log (currentMonth)
    let list_item = "";
    list_item += `<li class="event-items"><a href="${items.url}">`;
    list_item += `<div class="event-header">`;
    list_item += `<h3>${items.type}</h3>`;
    list_item += `</div>`;
    list_item += `<div class="event-description">`;
    list_item += `<div class="event-datetime">`;
    list_item += `<p>${new Date(
      items.timestamp.toDate()
    ).toLocaleDateString()} at ${new Date(
      items.timestamp.toDate()
    ).toLocaleTimeString()}</p>`;
    list_item += `</div>`;
    list_item += `<div class="event-location">`;
    list_item += `<p>${items.startLocation}</p>`;
    list_item += `</div>`;
    list_item += `<div class="event-desc-proper">`;
    list_item += `<p>${items.description}</p>`;
    list_item += `</div>`;
    // list_item += `<div class="event-type">`;
    // list_item += `<p>${items.type}</p>`;
    // list_item += `</div>`;
    list_item += `</div>`;
    list_item += `</a></li>`;
    event_item_list.innerHTML += list_item;
  }

  if (eventList.length === 0) {
    event_item_list.innerHTML = `<h3>No events for this month</h3>`;
  }
}

renderCalendar();
renderEvents();

//mobile menu
function mobileMenu() {
  desktopMenu.classList.toggle("mobile-menu-active");
}
hamburgerBtn.addEventListener("click", mobileMenu);