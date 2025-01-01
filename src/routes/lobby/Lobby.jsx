import { useState, useEffect, useRef } from "react";
import test_logo from "/covers/cover.jpg";
import { LobbyCard, CreateLobbyButton } from "../../components/LobbyCard/LobbyCard.jsx";
import "./Lobby.css";

function Lobby() {
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setShowContent(true);
		}, 100); // Delay to ensure content is rendered before animation
	}, []);

	return (
		<>
			<div className={`grid-container ${showContent ? "show" : ""}`}>
				<LobbyCard
					lobby_name="Lobby Name that is long"
					listeners_cnt="1"
					song_name="Song Name"
					artist_name="Artist Name"
					lobby_icon={test_logo}
					card_index="1"
				/>
				<LobbyCard
					lobby_name="Lobby Name that is long"
					listeners_cnt="1"
					song_name="Song Name"
					artist_name="Artist Name"
					lobby_icon={test_logo}
					card_index="2"
				/>
				<CreateLobbyButton
					card_index="3"
				/>
			</div>
		</>
	);
}

export default Lobby;
