import React, { useState, useEffect, ChangeEvent } from "react";
import {
  updateProfilePicture,
  fetchUserProfilePicture,
} from "../../api/user/userApi";
import SearchList from "@/components/Search/SearchList";

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
    <div className="flex items-center gap-6 w-full height-8 bg-secondary p-6 rounded-lg">
      <div className="relative">
        <img
          src={
            selectedImage ? URL.createObjectURL(selectedImage) : profilePicture
          }
          alt="User Profile"
          className="w-[100px] h-[100px] rounded-full object-cover"
          onClick={() => setShowModal(true)}
        />
      </div>
      
      <div className="flex flex-col text-white">
        <div className="text-sm text-gray-400">Profile</div>
        <h2 className="text-4xl font-bold">{username}</h2>
        <div className="flex text-sm text-gray-400 mt-2">
          <span>{usertag.split('@')[0]} Playlist</span>
          <span className="mx-1">•</span>
          <span>{friendcount} Friends</span>
        </div>
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-[#282828] p-5 rounded-lg shadow-md w-[300px] text-center">
            <h2 className="text-xl font-bold mb-4 text-white">Upload Profile Picture</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 text-white" />
            <div className="flex justify-between mt-5">
              <button 
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded border-none cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white py-2 px-4 rounded border-none cursor-pointer disabled:opacity-50"
                onClick={handleUpload} 
                disabled={isUpdating}
              >
                {isUpdating ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSearchList && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="relative bg-[#282828] p-6 rounded-lg w-[80%] max-w-[600px] max-h-[80vh] overflow-auto">
            <button
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full"
              onClick={() => setShowSearchList(false)}
            >
              X
            </button>
            <SearchList />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
