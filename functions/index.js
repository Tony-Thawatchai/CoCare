// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const path = require('path');
// const serviceAccount = require(path.join(__dirname, 'keys', 'cocare-d7fc8-firebase-adminsdk-v3vp6-de5262a91a.json'));
// const cors = require('cors')({ origin: true });

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://cocare-d7fc8-default-rtdb.firebaseio.com"
//   });


//   exports.sendnotification = functions.https.onCall(async (data, context) => {
//     if(!context.auth) {
//       throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
//     }
  
//     const { token, notification } = data;
//     console.log(`Notification : ${notification}`);
//     console.log(`Token : ${token}`);
  
//     const notificationPayload = {
//       notification: {
//         title: notification.title,
//         body: notification.body
//       }
//     }
  
//     try {
//       const response = await admin.messaging().sendToDevice(token, notificationPayload);
//     }catch(err){
//       console.error('Error sending notification:', err);
//       return { success: false };
//     }
  
//     console.log(`Notification Payload : ${JSON.stringify(notificationPayload)}`);
//     return { success: true };
//   });