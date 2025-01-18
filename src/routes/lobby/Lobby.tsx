// Node modules
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Locals
import {
	OpCode,
	wsSend,
	SocketResponse,
	SocketPayload,
} from "api/socketApi.ts";
import { LobbyModel, fetchLobbies } from "api/lobbyApi.ts";
import { MPState, SERVER_IP } from "@/const.jsx";
import { useAppState } from "@/AppState.jsx";
import {
	LobbyCard,
	CreateLobbyButton,
} from "components/LobbyCard/LobbyCard.jsx";

// Assets
import test_logo from "/covers/cover.jpg";
import "./Lobby.css";

function Lobby() {
	const [showContent, setShowContent] = useState<boolean>(false);
	const [lobbies, setLobbies] = useState<LobbyModel[]>([]);

	const { appState, ws, addMsgHandler, updateAppState, updateMusicState } =
		useAppState();
	const navigate = useNavigate();

	// Delay to ensure content is rendered before animation
	useEffect(() => {
		setTimeout(() => {
			setShowContent(true);
		}, 100);
	}, []);

	// Get the online lobbies
	useEffect(() => {
		if (ws.current === null) {
			console.log("Websocket is null!");
			return;
		}

		// Handling the response
		addMsgHandler(OpCode.GET_LOBBY_IDS, (res: SocketResponse) => {
			const init = async () => {
				let lobbies = await fetchLobbies(res.value);
				setLobbies(lobbies);
			};
			init();
		});

		// Requesting the lobby ids
		const payload: SocketPayload = {
			op_code: OpCode.GET_LOBBY_IDS,
			value: "empty",
		};
		wsSend(ws, payload);
	}, []);

	// Effect to switch to chat page if the user is already joined the lobby
	useEffect(() => {
		if (appState.in_lobby) {
			navigate("/chats");
		}
	}, []);

	const handleCreateLobby = async () => {
		let user_id = appState.user_id;

		if (ws.current === null) {
			console.log("Websocket is null!");
			return;
		}

		// Handling the response
		addMsgHandler(OpCode.CREATE_LOBBY, (res: SocketResponse) => {
			// Tagging the user as joined in lobby
			updateAppState({
				lobby_id: res.value.lobby_id,
				in_lobby: true,
				is_host: true,
			});

			// Clearning the current music when creating a new lobby
			updateMusicState({
				has_item: false,
				id: "",
				title: "",
				artist: "",
				cover_img: "",
				state: MPState.CHANGE_TIME,
				state_data: 0,
			});

			// Switching to chat page when sucessfully created lobby
			navigate("/chats");
		});

		// Requesting to create lobby (If sucess also makes the host join it)
		const payload: SocketPayload = {
			op_code: OpCode.CREATE_LOBBY,
			value: {
				host_id: user_id,
			},
		};
		wsSend(ws, payload);
	};

	const handleJoinLobby = (lobby_id: string) => {
		// Join Lobby Handler
		addMsgHandler(OpCode.JOIN_LOBBY, (res: SocketResponse) => {
			// Tagging the user as joined in lobby
			updateAppState({
				lobby_id: res.value.lobby_id,
				in_lobby: true,
				is_host: false,
			});

			// Clearning the current music when creating a new lobby
			updateMusicState({
				has_item: false,
				id: "",
				title: "",
				artist: "",
				cover_img: "",
				state: MPState.CHANGE_TIME,
				state_data: 0,
			});

			navigate("/chats");
		});

		let user_id = appState.user_id;
		const payload: SocketPayload = {
			op_code: OpCode.JOIN_LOBBY,
			value: {
				lobby_id: lobby_id,
				user_id: user_id,
			},
		};
		wsSend(ws, payload);
	};

	return (
		<>
			<div className="lobby-body">
				<h1 className="lobby-header"> Lobbies </h1>
				<div className="scrollable-area">
					<div className={`grid-container ${showContent ? "show" : ""}`}>
						{lobbies.map((lobby, idx) => (
							<LobbyCard
								key={lobby.id}
								lobby_id={lobby.id}
								lobby_name={lobby.lobby_name}
								listeners_cnt={lobby.listeners}
								song_name={lobby.song_name}
								artist_name={lobby.artist_name}
								lobby_icon={lobby.lobby_icon}
								card_index={idx}
								onClick={handleJoinLobby}
							/>
						))}
						<CreateLobbyButton card_index={3} onClick={handleCreateLobby} />
					</div>
				</div>
			</div>
		</>
	);
}

export default Lobby;
