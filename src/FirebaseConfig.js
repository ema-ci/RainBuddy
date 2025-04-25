// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
// https://firebase.google.com/docs/web/setup#available-libraries

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