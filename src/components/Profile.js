import './Profile.css';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, generateToken } from '../FirebaseConfig';
import { getAuth, signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential, validatePassword } from 'firebase/auth';

const VAPID_KEY = process.env.REACT_APP_VAPID_KEY;

function Profile({ user, onBack }) {
	const [userData, setUserData] = useState({
		name: '',
		city: '',
	});
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [password, setPassword] = useState(''); // Stato per la password
	const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

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

		setNotificationPermission(Notification.permission);
		fetchUserData();
	}, [user.uid]);


	
	const handleChange = async (e) => {
		const { name, value, type, checked } = e.target;

		if (name === 'dailyNotification') {
			// Richiedi permesso e stampa sempre il token
			const permission = await Notification.requestPermission();
			if (permission === 'granted') {
				generateToken();
				setMessage("Notifications allowed! to disable check your browser settings");
			} else {
				setMessage("Notification not allowed, check your browser settings");
			}
			return;
		}
		setUserData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			// Update Firestore
			await updateDoc(doc(db, 'users', user.uid), {
				name: userData.name,
				city: userData.city
			});

			setMessage("Profile updated successfully!");
			setIsLoading(false);
		} catch (error) {
			console.error("Error updating profile:", error);
			setMessage("Failed to update profile");
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			const auth = getAuth();
			await signOut(auth);
			setMessage("Logged out successfully");
			onBack(); // Torna alla schermata precedente o alla schermata di login
		} catch (error) {
			console.error("Error logging out:", error);
			setMessage("Failed to log out");
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
								checked={notificationPermission === 'granted'}
								onChange={handleChange}
							/>
							Receive Daily Notification
						</label>
					</div>

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
				<button
					onClick={handleLogout}
					className="logout-button"
				>
					Log Out
				</button>
			</div>
		</div>
	);
}

export default Profile;