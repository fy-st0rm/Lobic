import React, { useEffect, useState } from "react";
import ProfileCard from "./ProfileCard";
import PlaylistsContainer from "@/routes/profile/PlaylistsContainer/PlaylistsContainer";
import { useAppProvider } from "providers/AppProvider";
import { User, getUserData } from "@/api/user/userApi";

interface Friend {
  id: string;
  name: string;
}

function Profile() {
  const { appState } = useAppProvider();

  // State for user data
  const [userData, setUserData] = useState<User>({
    id: "",
    username: "",
    email: "",
    pfp: "",
  });

  // State for friends list
  const [friends, setFriends] = useState<Friend[]>([
    { id: "1", name: "Bijan" },
    { id: "2", name: "Bijan" },
    { id: "3", name: "Bijan" },
  ]);

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData(appState.user_id);
        setUserData(data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [appState]);

  // Add friend handler
  const handleAddFriend = () => {
    const newFriendName = prompt("Enter the friend's name:");
    if (!newFriendName) return;

    // Simulate adding a new friend (API integration can be added here)
    const newFriend: Friend = {
      id: Date.now().toString(), // Generate a unique ID
      name: newFriendName,
    };

    setFriends((prevFriends) => [...prevFriends, newFriend]);
  };

  return (
    <div className="flex flex-col w-full bg-primary min-h-screen">
      <div className="grid grid-cols-[3fr_1fr] gap-4 w-full">
        <div className="flex flex-col">
          <div className="mb-8">
            <ProfileCard
              usertag={userData.email || "3 Playlist"}
              username={userData.username || "Sadit Rasaili"}
              friendcount={friends.length}
              user_uuid={userData.id}
            />
          </div>

          <div className="px-6">
            <PlaylistsContainer />
          </div>
        </div>

        {/* Friends Section */}
        <div className="p-6 bg-secondary rounded-lg">
          <button
            className="w-full bg-button hover:bg-button_hover text-white text-sm py-2 px-4 rounded-full mb-6"
            onClick={handleAddFriend}
          >
            Add Friend
          </button>

          <h3 className="text-white text-lg font-bold mb-4">Friends</h3>
          <div className="flex flex-col gap-3">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <span className="text-white text-sm">{friend.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
