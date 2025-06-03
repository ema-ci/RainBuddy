import './Profile.css';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, generateToken } from '../FirebaseConfig';
import { getAuth, signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

function Profile({ user, onBack }) {
	const [userData, setUserData] = useState({
		name: '',
		city: '',
	});
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [password, setPassword] = useState('');
	const [notificationPermission, setNotificationPermission] = useState('unsupported');
	const [reportText, setReportText] = useState('');
	const [reportMessage, setReportMessage] = useState('');

	useEffect(() => {

		// Fetch user name and favourite city
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

		// Check for Notification support and permission
        if (typeof Notification !== 'undefined') {
            setNotificationPermission(Notification.permission);
        } else {
            setNotificationPermission('unsupported');
        }

		fetchUserData();
	}, [user.uid]);

	// Handle input changes (form fields and notification checkbox)
	const handleChange = async (e) => {
		const { name, value } = e.target;

		if (name === 'dailyNotification') {
			if (notificationPermission === 'unsupported') {
				setMessage("Notification not supported in this browser");
				return;
			}
			
			// Request permission and always print the token
			const permission = await Notification.requestPermission();

			if (permission === 'granted') {
				generateToken();
				setMessage("Notifications allowed! to disable check your browser settings");
				setNotificationPermission(permission);
			} else {
				setMessage("Notification not allowed, check your browser settings");
				setNotificationPermission(permission);
			}
			return;
		}

		setUserData(prev => ({
			...prev,
			[name]: value
		}));
	};

	// Handle form submission to update user data
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

	// Handle report submission
	const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'reports', user.uid), {
                report: reportText,
				createdAt: serverTimestamp()
            });
            setReportMessage('Report submitted successfully!');
            setReportText('');
        } catch (error) {
            console.error("Error submitting report:", error);
            setReportMessage('Failed to submit report.');
        }
    };

	// Handle user logout
	const handleLogout = async () => {
		try {
			const auth = getAuth();
			await signOut(auth);
			setMessage("Logged out successfully");
			onBack(); // Go back to the previous page after logout
		} catch (error) {
			console.error("Error logging out:", error);
			setMessage("Failed to log out");
		}
	};

	// Handle account deletion
	const handleDeleteAccount = async () => {
		setIsLoading(true);
		try {
			const auth = getAuth();
			const currentUser = auth.currentUser;

			// Re-authenticate the user
			const credential = EmailAuthProvider.credential(currentUser.email, password);
			await reauthenticateWithCredential(currentUser, credential);

			// Delete user data
			await deleteDoc(doc(db, 'users', user.uid));

			// Delete the user's authentication account
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

			<div className="report-zone">
				<h2>Report Issues</h2>
				<p>If you encounter any issues, please report them to us.</p>

				<form onSubmit={handleReportSubmit}>
					<div className="form-group">
						<input
							placeholder="Describe the issue..."
							value={reportText}
							onChange={e => setReportText(e.target.value)}
						/>
					</div>
					<button type="submit" className="save-button">Submit Report</button>
					
					{reportMessage && <p className="message">{reportMessage}</p>}
                </form>

			</div>

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