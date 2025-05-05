import './Profile.css';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

function Profile({ user, onBack }) {
  const [userData, setUserData] = useState({
    name: '',
    city: '',
    dailyNotification: false,
    notificationTime: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState(''); // Stato per la password

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(prevData => ({
            ...prevData,
            ...data
          }));
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage("Failed to load user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user.uid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        city: userData.city,
        dailyNotification: userData.dailyNotification,
        notificationTime: userData.dailyNotification ? userData.notificationTime : null,
      });
      
      setMessage("Profile updated successfully!");
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile");
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      // Ri-autenticazione dell'utente
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Elimina i dati dell'utente da Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Elimina l'account di autenticazione dell'utente
      await deleteUser(currentUser);

      setMessage("Account deleted successfully");
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage("Failed to delete account. Please ensure your password is correct or sign in again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <header>
        <button onClick={onBack} className="back-button">← Back</button>
        <h2>User Profile</h2>
      </header>
      
      {isLoading ? (
        <p>Loading profile data...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Default City</label>
            <input
              type="text"
              name="city"
              value={userData.city}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="dailyNotification"
                checked={userData.dailyNotification}
                onChange={handleChange}
              />
              Receive Daily Notification
            </label>
          </div>
          
          {userData.dailyNotification && (
            <div className="form-group">
              <label>Notification Time</label>
              <input
                type="time"
                name="notificationTime"
                value={userData.notificationTime || ''}
                onChange={handleChange}
              />
            </div>
          )}
          
          <button type="submit" className="save-button">Save Profile</button>
          
          {message && <p className="message">{message}</p>}
        </form>
      )}
      
      <div className="danger-zone">
        <h2>Danger Zone</h2>
        {showDeleteConfirm ? (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
            >
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="delete-confirm-button">
                Yes, delete my account
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="delete-button"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;