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
    <div className="flex flex-row items-center gap-7 w-fit">
      <div>
        <img
          src={
            selectedImage ? URL.createObjectURL(selectedImage) : profilePicture
          }
          alt="User Profile"
          className="w-[200px] h-[200px] rounded-full"
        />
      </div>
      <div className="flex flex-col m-0 p-0 text-white">
        <h4 className="m-0 ml-2.5 font-normal">{usertag}</h4>
        <h2 className="m-0 font-bold text-[20pt] ml-2.5">{username}</h2>
        <h3 className="m-0 text-[12pt] font-normal ml-2.5">{friendcount}</h3>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setShowModal(true)}
        disabled={isUpdating}
      >
        {isUpdating ? "Updating..." : "Update Profile Picture"}
      </button>

      <button
        className="ml-[400px] bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        onClick={() => setShowSearchList(!showSearchList)}
      >
        {showSearchList ? "Close Friend" : "Add Friend"}
      </button>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-5 rounded-lg shadow-md w-[300px] text-center">
            <h2 className="text-xl font-bold mb-4">Upload Profile Picture</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
            <div className="flex justify-between mt-5">
              <button 
                className="bg-gray-300 hover:bg-gray-400 py-2.5 px-5 rounded border-none cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-5 rounded border-none cursor-pointer disabled:opacity-50"
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
          <div className="relative bg-white p-6 rounded-lg w-[80%] max-w-[600px] max-h-[80vh] overflow-auto">
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
