import React from 'react';
import './Fallback.css'; // Puoi creare uno stile personalizzato per questa pagina

function Fallback() {
  return (
    <div className="offline-fallback">
      <h1>Oops! You're Offline</h1>
      <p>It seems like you don't have an active internet connection.</p>
      <p>Please check your connection and try again.</p>
    </div>
  );
}

export default Fallback;