import React, { useState, useEffect, ChangeEvent } from "react";
import {
	updateProfilePicture,
	fetchUserProfilePicture,
} from "@/api/user/userApi";
import Pencil from "/profile/pencil.svg";
import UploadModal from "@/components/UploadModal";

// ProfilePicture and UserInfo components remain unchanged
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
		<div className="flex items-center gap-6 bg-secondary p-6 rounded-lg mb-8">
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
