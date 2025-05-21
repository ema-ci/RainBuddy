importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');


// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyAdsKr-EAygA6baNYtudzaaG4yhpZd4Jfk",
  authDomain: "rainbuddy-eb5e6.firebaseapp.com",
  projectId: "rainbuddy-eb5e6",
  storageBucket: "rainbuddy-eb5e6.firebasestorage.app",
  messagingSenderId: "124013588735",
  appId: "1:124013588735:web:3aa017b025bb94baf5dcca"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage( (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});