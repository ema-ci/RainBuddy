import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";  

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdsKr-EAygA6baNYtudzaaG4yhpZd4Jfk",
  authDomain: "rainbuddy-eb5e6.firebaseapp.com",
  projectId: "rainbuddy-eb5e6",
  storageBucket: "rainbuddy-eb5e6.firebasestorage.app",
  messagingSenderId: "124013588735",
  appId: "1:124013588735:web:3aa017b025bb94baf5dcca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

export const VAPID_KEY = process.env.REACT_APP_VAPID_KEY;
export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log("Notification permission status:", permission);

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      console.log("FCM Token:", token);
    }

  } catch (err) {
    console.error("Error requesting notification permission:", err);
  }
}