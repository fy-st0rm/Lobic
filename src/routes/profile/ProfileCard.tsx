import React, { useState, useEffect, ChangeEvent } from "react";
import "./ProfileCard.css";
import {
	updateProfilePicture,
	fetchUserProfilePicture,
} from "../../api/user/userApi";
import SearchList from "components/SearchList/SearchList";

interface ProfileCardProps {
	usertag: string;
	username: string;
	friendcount: number;
	user_uuid: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
	usertag,
	username,
	friendcount,
	user_uuid,
}) => {
	const [isUpdating, setIsUpdating] = useState<boolean>(false);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [profilePicture, setProfilePicture] = useState<string>("/sadit.jpg");
	const [showSearchList, setShowSearchList] = useState<boolean>(false);

	useEffect(() => {
		const fetchProfilePicture = async (): Promise<void> => {
			try {
				const imageUrl = await fetchUserProfilePicture(user_uuid);
				setProfilePicture(imageUrl);
			} catch (error) {
				console.error("Failed to fetch profile picture:", error);
				setProfilePicture("/sadit.jpg");
			}
		};

		fetchProfilePicture();
	}, [user_uuid]);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedImage(file);
		}
	};

	const handleUpload = async (): Promise<void> => {
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
					src={
						selectedImage ? URL.createObjectURL(selectedImage) : profilePicture
					}
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

			<button
				className="add-friend-button"
				onClick={() => setShowSearchList(!showSearchList)}
			>
				{showSearchList ? "Close Friend" : "Add Friend"}
			</button>

			{showModal && (
				<div className="modal-overlay">
					<div className="modal">
						<h2>Upload Profile Picture</h2>
						<input type="file" accept="image/*" onChange={handleFileChange} />
						<div className="modal-buttons">
							<button onClick={() => setShowModal(false)}>Cancel</button>
							<button onClick={handleUpload} disabled={isUpdating}>
								{isUpdating ? "Uploading..." : "Upload"}
							</button>
						</div>
					</div>
				</div>
			)}

			{showSearchList && (
				<div className="search-overlay">
					<button
						className="close-popup-button"
						onClick={() => setShowSearchList(false)}
					>
						X
					</button>

					<SearchList />
				</div>
			)}
		</div>
	);
};

export default ProfileCard;
