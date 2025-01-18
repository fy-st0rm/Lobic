import React, { useState, useEffect } from "react";
import "./ProfileCard.css";
import { updateProfilePicture, fetchUserProfilePicture } from "../../api/userApi";

function ProfileCard({ usertag, username, friendcount, user_uuid }) {
	const [isUpdating, setIsUpdating] = useState(false);
	const [showModal, setShowModal] = useState(false); // State to control modal visibility
	const [selectedImage, setSelectedImage] = useState(null); // State to store the selected image file
	const [profilePicture, setProfilePicture] = useState("/public/sadit.jpg"); // State to store the profile picture URL

	// Fetch the user's profile picture when the component mounts
	useEffect(() => {
		const fetchProfilePicture = async () => {
			try {
				const imageUrl = await fetchUserProfilePicture(user_uuid); // Call the API
				setProfilePicture(imageUrl); // Update state with the fetched image URL
			} catch (error) {
				console.error("Failed to fetch profile picture:", error);
				setProfilePicture("/public/sadit.jpg"); // Fall back to the default image
			}
		};

		fetchProfilePicture();
	}, [user_uuid]); // Re-run effect if user_uuid changes

	// Handle file selection
	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setSelectedImage(file);
		}
	};

	// Handle image upload
	const handleUpload = async () => {
		if (!selectedImage) {
			alert("Please select an image first.");
			return;
		}

		try {
			setIsUpdating(true);
			const imageUrl = URL.createObjectURL(selectedImage);
			await updateProfilePicture(user_uuid, imageUrl); 
			setProfilePicture(imageUrl); 
			setShowModal(false);
		} catch (error) {
			console.error("Failed to update profile picture:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="info-container">
			<div className="profile-pic-container">
				<img
					src={selectedImage ? URL.createObjectURL(selectedImage) : profilePicture}
					alt="User Profile"
					className="user-pic"
				/>
			</div>
			<div className="user-details-container">
				<h4>{usertag}</h4>
				<h2>{username}</h2>
				<h3>{friendcount}</h3>
			</div>
			<button
				className="upload-btn"
				onClick={() => setShowModal(true)}
				disabled={isUpdating}
			>
				{isUpdating ? "Updating..." : "Update Profile Picture"}
			</button>

			{/* Modal for image upload */}
			{showModal && (
				<div className="modal-overlay">
					<div className="modal">
						<h2>Upload Profile Picture</h2>
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
						/>
						<div className="modal-buttons">
							<button onClick={() => setShowModal(false)}>Cancel</button>
							<button onClick={handleUpload} disabled={isUpdating}>
								{isUpdating ? "Uploading..." : "Upload"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default ProfileCard;