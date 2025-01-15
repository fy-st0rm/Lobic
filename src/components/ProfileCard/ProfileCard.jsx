import React, { useState } from "react";
import Image from "/public/pic_test_2.png";
import "./ProfileCard.css";
import { updateProfilePicture } from "../../api/userApi";

function ProfileCard({ usertag, username, friendcount, user_uuid }) {
	const [isUpdating, setIsUpdating] = useState(false);

	const handleUpload = async () => {
		try {
			setIsUpdating(true);
			await updateProfilePicture(user_uuid, Image);
		} catch (error) {
			console.error("Failed to update profile picture:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="info-container">
			<div className="profile-pic-container">
				<img src={Image} alt="User Profile" className="user-pic" />
			</div>
			<div className="user-details-container">
				<h4>{usertag}</h4>
				<h2>{username}</h2>
				<h3>{friendcount}</h3>
			</div>
			<button
				className="upload-btn"
				onClick={handleUpload}
				disabled={isUpdating}
			>
				{isUpdating ? "Updating..." : "Update Profile Picture"}
			</button>
		</div>
	);
}

export default ProfileCard;
