import { useState, useEffect, useRef } from "react";

import { OpCode, SERVER_IP, wsSend } from "../../const.jsx";
import { useAppState } from "../../AppState.jsx";
import { LobbyCard, CreateLobbyButton } from "../../components/LobbyCard/LobbyCard.jsx";

import test_logo from "/covers/cover.jpg";
import "./Lobby.css";

function Lobby() {
	const [showContent, setShowContent] = useState(false);
	const [lobbyIds, setLobbyIds] = useState([]);

	const { appState, ws, updateLobbyState, addMsgHandler } = useAppState();

	useEffect(() => {
		setTimeout(() => {
			setShowContent(true);
		}, 100); // Delay to ensure content is rendered before animation
	}, []);

	// Get the online lobbies
	useEffect(() => {
		if (ws.current === null) {
			console.log("Websocket is null!");
			return;
		}

		// Handling the response
		addMsgHandler(OpCode.GET_LOBBY_IDS, (res) => {
			setLobbyIds(res.value);
		});

		// Requesting the lobby ids
		const payload = {
			op_code: OpCode.GET_LOBBY_IDS,
			value: ""
		};
		wsSend(ws, payload);
	}, []);

	const handleCreateLobby = async () => {
		let user_id = appState.user_id;

		if (ws.current === null) {
			console.log("Websocket is null!");
			return;
		}

		// Handling the response
		addMsgHandler(OpCode.CREATE_LOBBY, (res) => {
			// Tagging the user as joined in lobby
			updateLobbyState(res.value.lobby_id, true);
		});

		// Requesting to create lobby (If sucess also makes the host join it)
		const payload = {
			op_code: OpCode.CREATE_LOBBY,
			value: {
				host_id: user_id
			}
		};
		wsSend(ws, payload);
	}

	return (
		<>
			<div className={`grid-container ${showContent ? "show" : ""}`}>
				{
					lobbyIds.map((id, idx) => (
						<LobbyCard
							key={idx}
							lobby_name={id}
							listeners_cnt="1"
							song_name="Song Name"
							artist_name="Artist Name"
							lobby_icon={test_logo}
							card_index={idx}
						/>
					))
				}
				<CreateLobbyButton
					card_index="3"
					onClick={handleCreateLobby}
				/>
			</div>
		</>
	);
}

export default Lobby;
