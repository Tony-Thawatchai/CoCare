const confirmPickUp = document.getElementById('confirmPickUp');

confirmPickUp.addEventListener("click", () => {
  console.log('click real time');
  getRealTimeLocation();
});

let latitude;
let longitude;
let liveLocation = { lat: 49.256139, lng: -123.116389 };
let routeCoordinates = [];
let startTime;
const imgFlag = "https://picsum.photos/50/50?random=77"; //change this to user profile picture instead

const symbolOne = {
  path: "M -2,0 0,-2 2,0 0,2 z",
  strokeColor: "#F00",
  fillColor: "#F00",
  fillOpacity: 1,
};
const symbolTwo = {
  path: "M -2,-2 2,2 M 2,-2 -2,2",
  strokeColor: "#292",
  strokeWeight: 4,
};
const symbolThree = {
  path: "M -2,0 0,-2 2,0 0,2 z",
  strokeColor: "gold",
  fillColor: "gold",
  fillOpacity: 1,
};

function getRealTimeLocation() {
  console.log("getRealTimeLocation is called");
  startTime = Date.now();
  console.log(`startTime =${startTime}`);
  let link = document.createElement("a");
  while (outputLocation.firstChild) {
    outputLocation.removeChild(outputLocation.firstChild);
  }
  navigator.geolocation.watchPosition(
    (position) => {
      console.log(`location changed!!!`);

      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      console.log(position.coords);
      link.setAttribute("target", `_blank`);
      link.setAttribute(
        "href",
        `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
      );

      // Calculate milliseconds in a minute

      let secondSince = Math.round((Date.now() - startTime) / 1000);
      let interval = secondSince / 60;
      console.log(`interval=` + interval);
      function drawTimeSince() {
        if (interval > 1) {
          link.innerHTML =
            `last update ` + Math.floor(interval) + " minutes ago";
        } else {
          link.innerHTML =
            `last update ` + Math.floor(secondSince) + " seconds ago";
        }
        console.log(secondSince);

        outputLocation.appendChild(link);
      }
      drawTimeSince();

      liveLocation = { lat: latitude, lng: longitude };
      routeCoordinates.push(liveLocation);
      initMarker();
    },
    (error) => {
      // failure callback is called w. error object
      console.log(error);
      if (error.code == error.PERMISSION_DENIED) {
        window.alert("geolocation permission denied");
      }
    }
  );
}

console.log(longitude);
console.log(latitude);

// map auto complete

let apiKey = "";

// Create the script tag, set the appropriate attributes
let script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&region=CA&callback=initMap`;
script.async = true;
script.defer = true;

// Initialize and add the map
function initMap() {
  // The map
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: liveLocation,
  });
}

window.initMap = initMap;

// Initialize and add the map
function initMarker() {
  console.log(liveLocation);
  //   The map
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: liveLocation,
  });
  //   The marker
  const symbolFour = {
    path: google.maps.SymbolPath.CIRCLE,
    strokeColor: "hotpink",
    fillColor: "hotpink",
    fillOpacity: 1,
    scale: 5,
    strokeWeight: 1,
  };
  const marker = new google.maps.Marker({
    position: liveLocation,
    map: map,
    icon: symbolFour
      
    
    // icons: [
    //   // {
    //   //   icon: symbolFour,
    //   // },
    //   {
    //     icon: imgFlag,
    //   },
    // ],
  });

  const routePath = new google.maps.Polyline({
    path: routeCoordinates,
    icons: [
      {
        icon: symbolOne,
        offset: "0%",
      },
      {
        icon: symbolFour,
        offset: "100%",
      },
      {
        icon: symbolThree,
        offset: "0%",
      },
    ],
    geodesic: true,
    strokeColor: "red",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  routePath.setMap(map);
  animateIcon(routePath);
  animateMarker(marker);
}

function animateMarker(marker) {
  let count = 1;
  window.setInterval(() => {
    count = (count + 1) % 50;
    const animatedMarker = marker.get("icon");
    animatedMarker.strokeWeight = count;
    marker.set("icon", animatedMarker)
    // const icons = line.get("icons");

    // icons[2].offset = count / 2 + "%";
    // line.set("icons", icons);
  }, 20);
}

function animateIcon(line) {
  let count = 0;

  window.setInterval(() => {
    count = (count + 1) % 200;
    const icons = line.get("icons");

    icons[2].offset = count / 2 + "%";
    line.set("icons", icons);
  }, 20);
}

// ***********************************************************


// Append the 'script' element to 'head'
document.head.appendChild(script);
