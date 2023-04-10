// // Temporary adding a service worker for pwa
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./sw.js')
//         .then(function (reg) {
//             console.log(`Service Worker Registered`);
//         })
//         .catch(function (error) {
//             console.log(`Service Worker Error (${error})`);
//         });
// } else {
//     console.error("This browser doesn't support Service Worker");
// }

const notification_button = document.querySelector('#button-notifications');
notification_button.addEventListener('click', () => {
    window.location.href = '/notifications';
});

function updateOfflineStatus() {
    const offlineMessage = document.querySelector('.offline-message');
    if (navigator.onLine) {
        offlineMessage.style.display = 'none';
    } else {
        offlineMessage.style.display = 'block';
    }
}

window.addEventListener('online', updateOfflineStatus);
window.addEventListener('offline', updateOfflineStatus);
updateOfflineStatus();