import React, { useState, useEffect, ChangeEvent } from "react";
import {
	updateProfilePicture,
	fetchUserProfilePicture,
} from "@/api/user/userApi";
import Pencil from "/profile/pencil.svg";

// Profile Picture Component
interface ProfileCardProps {
	usertag: string;
	username: string;
	friendcount: number;
	user_uuid: string;
}
const ProfilePicture: React.FC<{
	imageUrl: string;
	onEditClick: () => void;
	selectedImage: File | null;
}> = ({ imageUrl, onEditClick, selectedImage }) => (
	<div className="relative">
		<img
			src={selectedImage ? URL.createObjectURL(selectedImage) : imageUrl}
			alt="User Profile"
			className="w-[100px] h-[100px] rounded-full object-cover"
		/>
		<button
			className="absolute bottom-0 -right-2 bg-primary p-2 rounded-full hover:bg-darker h-7 w-7 flex items-center justify-center cursor-pointer"
			onClick={onEditClick}
		>
			<img src={Pencil} alt="Edit Profile" />
		</button>
	</div>
);

// User Info Component
const UserInfo: React.FC<{
	usertag: string;
	username: string;
	friendcount: number;
}> = ({ usertag, username, friendcount }) => (
	<div className="flex flex-col text-white">
		<div className="text-sm text-gray-400">Profile</div>
		<h2 className="text-4xl font-bold">{username}</h2>
		<div className="flex text-sm text-gray-400 mt-2">
			<span>{usertag.split("@")[0]} Playlist</span>
			<span className="mx-1">•</span>
			<span>{friendcount} Friends</span>
		</div>
	</div>
);

// Upload Modal Component
const UploadModal: React.FC<{
	showModal: boolean;
	onClose: () => void;
	onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onUpload: () => void;
	isUpdating: boolean;
}> = ({ showModal, onClose, onFileChange, onUpload, isUpdating }) =>
	showModal && (
		<div className="fixed top-0 left-0 w-full h-full bg-primary bg-opacity-80 flex justify-center items-center z-50">
			<div className="bg-secondary bg-opacity-98 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
				<h2 className="text-2xl font-semibold text-white mb-6">
					Upload Profile Picture
				</h2>
				<input
					type="file"
					accept="image/*"
					onChange={onFileChange}
					className="mb-6 text-gray-300"
				/>
				<div className="flex justify-center space-x-4">
					<button
						className="bg-button hover:bg-button_hover text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105"
						onClick={onUpload}
						disabled={isUpdating}
					>
						{isUpdating ? "Uploading..." : "Upload"}
					</button>
					<button
						className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105"
						onClick={onClose}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);

// Main ProfileCard Component
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

	useEffect(() => {
		const fetchProfilePicture = async () => {
			try {
				const imageUrl: string = await fetchUserProfilePicture(user_uuid);
				setProfilePicture(imageUrl);
			} catch (error) {
				console.error("Failed to fetch profile picture:", error);
				setProfilePicture("/sadit.jpg");
			}
		};
		fetchProfilePicture();
	}, [user_uuid]);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) setSelectedImage(file);
	};

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
		<div className="flex items-center gap-6 bg-secondary p-6 rounded-lg">
			<ProfilePicture
				imageUrl={profilePicture}
				onEditClick={() => setShowModal(true)}
				selectedImage={selectedImage}
			/>
			<UserInfo
				usertag={usertag}
				username={username}
				friendcount={friendcount}
			/>
			<UploadModal
				showModal={showModal}
				onClose={() => setShowModal(false)}
				onFileChange={handleFileChange}
				onUpload={handleUpload}
				isUpdating={isUpdating}
			/>
		</div>
	);
};
export default ProfileCard;
