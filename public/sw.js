const cacheName = "cocare_v1";
const urlsToCache = [
    "/templates/offline.html",
    "/styles/offline.css",
    "/icons/sad-offline.svg",
    "/scripts/offline.js"
];
self.addEventListener('install', (event) => {
    console.log(`[SW] Event fired: ${event.type}`);
    event.waitUntil(
		  caches.open( cacheName )
			  .then( ( cache ) => {
				  return cache.addAll( urlsToCache );
		}));
    // self.skipWaiting();
    console.log(`[SW] installed`);
});

async function deleteOldCache() {
    const keyList = await caches.keys();
    return Promise.all( keyList.map( ( key ) => {
      if ( key !== cacheName  ) {
        return caches.delete( key ); 
      }
    }));
}

self.addEventListener('activate', (event) => {
    event.waitUntil( deleteOldCache() );
    self.clients.claim();
    console.log(`[SW] activated`);
});

async function handleFetch(event) {
    try {
        // console.log(`[SW] Fetching ${event.request.url}`)
        const response = await fetch(event.request);
        // console.log(`[SW] Response${response} and ${response.status}`)
        return response;
    }catch(err) {
        if(!navigator.onLine) {
            const cacheReponse = await caches.match('/templates/offline.html');
            if(cacheReponse) return cacheReponse;
        }
    }
}

self.addEventListener('fetch', event => {
    event.respondWith(handleFetch(event));
});