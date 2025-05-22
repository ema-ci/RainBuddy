import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { messaging } from './FirebaseConfig';

// bad attempt to register the service worker for iOS notidications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log("Service Worker registered");
      if (messaging && messaging.useServiceWorker) {
        messaging.useServiceWorker(registration);
      }
    })
    .catch((err) => {
      console.error("Errore during registration SW:", err);
    });
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);