// Node modules
import React, { useEffect, useState } from "react";

// Local
import ProfileCard from "./ProfileCard";
import PlaylistsContainer from "@/routes/profile/PlaylistsContainer/PlaylistsContainer";
import { useAppProvider } from "providers/AppProvider";
import { User, getUserData } from "@/api/user/userApi";

function Profile() {
  const { appState } = useAppProvider();

  // State with type annotations
  const [userData, setUserData] = useState<User>({
    id: "",
    username: "",
    email: "",
    pfp: "",
  });

  const [loading, setLoading] = useState<boolean>(true);

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
  
  return (
    <>
      <div className="home-container">
        <div className="grid grid-cols-[3fr_1fr] gap-x-[50px] justify-start w-full flex-1 overflow-y-auto overflow-x-hidden scrollbar-none z-[1] mr-[5px] pr-[10px] h-[90vh]">
          <div className="flex flex-col p-0">
            <div className="mt-[90px] mr-0 ml-[200px] w-full">
              <ProfileCard
                usertag={userData.email}
                username={userData.username}
                friendcount={10}
                user_uuid={userData.id}
              />
            </div>

            <div className="mt-[60px] w-full">
              <PlaylistsContainer />
            </div>
          </div>
        </div>
        <div className="bg-red-50 col-span-1 w-10 h-10">hello world</div>
      </div>
    </>
  );
}

export default Profile;
