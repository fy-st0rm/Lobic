import React, { useEffect, useState } from "react";
import "./Profile.css";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import SearchList from "../../components/SearchList/SearchList.jsx";
import PlaylistsContainer from "../../components/PlaylistsContainer/PlaylistsContainer.jsx";
import { useAppState } from "../../AppState.jsx";
import { getUserData } from "../../api/userApi";

function Profile() {
	const { appState } = useAppState();
	const [userData, setUserData] = useState({
		username: "",
		email: "",
	});
	const [loading, setLoading] = useState(true);

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
	}, [appState.user_id]);




	return (
		<>
			<div className="home-container">
				<div className="profile-page-container">
					<div className="main-content">
						<div className="profile-info">
							<ProfileCard
								usertag={userData.email} 
								username={userData.username} 
								friendcount={`Friend Count`}
								user_uuid={appState.user_id}
							/>
						</div>
						<div className="playlists-container">
							<PlaylistsContainer />
						</div>
					</div>
					<div className="search-list-container">
						<SearchList />
					</div>
				</div>
			</div>
		</>
	);
}

export default Profile;