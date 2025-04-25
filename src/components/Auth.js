import './Auth.css';
import React, { useState } from 'react';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../FirebaseConfig'; // Import Firestore
import { doc, setDoc } from 'firebase/firestore'; // Firestore methods

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [dailyNotification, setDailyNotification] = useState(false);
  const [notificationTime, setNotificationTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name,
          city,
          dailyNotification,
          notificationTime: dailyNotification ? notificationTime : null,
        });

        //alert('Registration successful!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        //alert('Login successful!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="landing-page">
      <div className="form-container">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <label>
                <input
                  type="checkbox"
                  checked={dailyNotification}
                  onChange={(e) => setDailyNotification(e.target.checked)}
                />
                Receive daily notification?
              </label>
              {dailyNotification && (
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  required
                />
              )}
            </>
          )}
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;