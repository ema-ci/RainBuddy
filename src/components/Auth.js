import './Auth.css';
import logo from '../assets/logo.png';
import github from '../assets/github.png';

import React, { useState } from 'react';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  // Handle form submission for login or registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {

      if (isRegistering) {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional data
        await setDoc(doc(db, 'users', user.uid), {
          name,
          city,
        });
        //alert('Registration successful!');

      } else {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
        //alert('Login successful!');
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="landing-page">

      <img src={logo} alt="Logo" className="logo" />

      <div className="form-container">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isRegistering && (
            <>
              <hr></hr>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
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
          
      <a href="https://github.com/ema-ci/RainBuddy" target="_blank" rel="noopener noreferrer">
        <img src={github} alt="GitHub" className="github-logo" />
      </a>

    </div>
  );
}

export default Auth;