import { onAuth } from "./firebase-disable.js";

document.addEventListener("click", (evt) => {
  const { target } = evt;
  if (!target.matches("nav a")) {
    return;
  }
  evt.preventDefault();
  route();
});

// Routes for signed off users
const offRoutes = {
  404: {
    template: "../templates/404.html",
    title: "",
    description: "",
  },
  "/contactus": {
    template: "../templates/contactus.html",
    title: "",
    description: "",
  },
  "/aboutus": {
    template: "../templates/aboutus.html",
    title: "",
    description: "",
  },
  "/": {
    template: "../templates/home.html",
    title: "",
    description: "",
  },
  "/signup": {
    template: "../templates/signup.html",
    title: "",
    description: "",
  },
  "/signin": {
    template: "../templates/signin.html",
    title: "",
    description: "",
  }, 
  // temporary router for testing purpose
  "/realtimelocation": {
    template: "../templates/realtimelocation.html",
    title: "",
    description: "",
  }
  
};

// Routes for signed on users
const onRoutes = {
  404: {
    template: "../templates/404.html",
    title: "",
    description: "",
  },
  '/search': {
    template: "../templates/search.html",
    title: "",
    description: "",
  },
  "/": {
    template: "../templates/dashboard.html",
    title: "",
    description: "",
  },
  "/signup2": {
    template: "../templates/signup2.html",
    title: "",
    description: "",
  },
  "/profile": {
    template: "../templates/profile.html",
    title: "",
    description: "",
  },
  // Temp route for testing purpose
  // "/profile/:id([A-Za-z0-9]+)": {
  //   template: "../templates/profile.html",
  //   title: "",
  //   description: "",
  // },
  // Temp route for testing purpose
  "/profiles": {
    template: "../templates/profiles.html",
    title: "",
    description: "",
  },
  "/calendar": {
    template: "../templates/calendar.html",
    title: "",
    description: "",
  },
  "/notifications": {
    template: "../templates/notifications.html",
    title: "",
    description: "",
  },
  "/care": {
    template: "../templates/care.html",
    title: "",
    description: "",
  },
  "/get-care": {
    template: "../templates/get-care.html",
    title: "",
    description: "",
  },
  "/give-care": {
    template: "../templates/give-care.html",
    title: "",
    description: "",
  },
  "/messages": {
    template: "../templates/messages.html",
    title: "",
    description: "",
  },
  // temporary router for testing purpose
  "/realtimelocation": {
    template: "../templates/realtimelocation.html",
    title: "",
    description: "",
  },
  "/parents": {
    template: "../templates/parents.html",
    title: "",
    description: "",
  }
};

const route = (evt) => {
  evt = evt || window.event;
  evt.preventDefault();

  window.history.pushState({}, "", evt.target.href);
  urlLocationHandler();
};

const urlLocationHandler = async () => {
  // Define location and create a constant
  const location = window.location.pathname;
  let params = null;
  if (location.length == 0) location = `/`;
  
  // Check if the location is /profile and extract the second parameter
  if(location.startsWith("/profile/")) {
    const parts = location.split("/");
    if(parts.length > 2) {
      params = parts[2];
    }
    location = "/profile";
  }

  // Verify Login Status
  try {
    await onAuth(async (user) => {
      if (user) {
        // TODO: user is logged in(list details and expand here) using the onRoutes
        // TODO: input a loading screen while waiting for this guys to finish
        const route = onRoutes[location] || onRoutes[404];
        const html = await fetch(route.template).then((response) =>
          response.text()
        );
        document.getElementById("app-wrapper").innerHTML = html;
        await loadJSFile(location);
        loadCSSFile(location);
  
        // Pass the second parameter to the profile.js if present
        // if( location === "/profile" && params ) {
        //   const profileModule = await import("./profile.js");
        //   profileModule.loadProfile(params);
        // }
      } else {
        console.log(user);
        // TODO: user is logged off create a proper routes using offRoutes
        //Create a 401 Response Code and HTML
        // TODO: input a loading screen while waiting for this guys to finish
        const route = offRoutes[location] || offRoutes[404];
        const html = await fetch(route.template).then((response) =>
          response.text()
        );
        document.getElementById("app-wrapper").innerHTML = html;
        loadJSFile(location);
        loadCSSFile(location);
      }
    });
  }catch(err) {
    console.log(err);
  }
};

async function loadJSFile(location) {
  // Load JS file ===================
  console.log(location);
  if( location === "/") {
    onAuth(async (user) => {
      if(user) {
        const scriptModule = await import("./dashboard.js");
      } else {
        const scriptModule = await import("./home.js");
      }
    });
  }else {
    const scriptModule = await import(`.${location}.js`);
  }
}

function loadCSSFile(location) {
  // Load CSS file ==================
  const style = document.createElement("link");
  if (location === "/") {
    style.href = `styles/home.css`;
  } else {
    style.href = `styles${location}.css`;
  }
  style.rel = "stylesheet";
  document.head.append(style);
}

document.addEventListener("DOMContentLoaded", () => {
  window.onpopstate = urlLocationHandler;
  if(navigator.onLine) {
    onAuth((user) => {
      if (user) {
        window.route = onRoutes;
      } else {
        window.route = offRoutes;
      }
    });
    urlLocationHandler();
  }else {
    handleConnection();
  }
});

// Handle offline connection(Fallback)
async function handleConnection() {
  if (!navigator.onLine) {
    const cacheReponse = await caches.match('/templates/offline.html');
    if(cacheReponse) {
      const html = await cacheReponse.text();
      document.innerHTML = html;
    }
  }
}

// Create a route constant to handle url.
// const route = urlRoutes[location] || urlRoutes[404];