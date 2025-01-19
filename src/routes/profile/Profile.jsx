// Node modules
import React from "react";

// Local
import ProfileCard from "components/ProfileCard/ProfileCard";
import SearchList from "components/SearchList/SearchList";
import PlaylistsContainer from "components/PlaylistsContainer/PlaylistsContainer";
import { useAppProvider} from "providers/AppProvider";

// Assets
import "./Profile.css";

function Profile() {
	const { appState } = useAppProvider();
	return (
		<>
			<div className="home-container">
				<div className="profile-page-container">
					<div className="main-content">
						<div className="profile-info">
							<ProfileCard
								usertag={`@bijan`}
								username={`Bijan Thapa`}
								friendcount={`0 friends`}
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
