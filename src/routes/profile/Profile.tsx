// Node modules
import React, { useEffect, useState } from "react";

// Local
import ProfileCard from "components/ProfileCard/ProfileCard";
import SearchList from "components/SearchList/SearchList";
import PlaylistsContainer from "components/PlaylistsContainer/PlaylistsContainer";
import { useAppProvider } from "providers/AppProvider";
import { getUserData } from "api/userApi";

// Assets
import "./Profile.css";

// Define the type for user data
interface UserData {
	username: string;
	email: string;
}

function Profile() {
	const { appState } = useAppProvider();

	// State with type annotations
	const [userData, setUserData] = useState<UserData>({
		username: "",
		email: "",
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

	if (loading) {
		return <div>Loading...</div>; // Add a loading state
	}

	return (
		<>
			<div className="home-container">
				<div className="profile-page-container">
					<div className="main-content">
						<div className="profile-info">
							<ProfileCard
								usertag={userData.email}
								username={userData.username}
								friendcount={10}
								user_uuid={appState.user_id}
							/>
						</div>

						<div className="playlists-container">
							<PlaylistsContainer />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Profile;
