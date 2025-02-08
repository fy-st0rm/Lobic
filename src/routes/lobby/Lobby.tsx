// Node modules
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Locals
import { OpCode, wsSend, SocketResponse, SocketPayload } from "api/socketApi";
import { LobbyModel, fetchLobbies } from "api/lobbyApi";
import { MPState } from "@/api/music/musicApi";
import { SERVER_IP } from "@/const";
import { LobbyCard, CreateLobbyButton } from "components/LobbyCard/LobbyCard";
import { useAppProvider } from "providers/AppProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useMusicProvider } from "providers/MusicProvider";

// Assets
import test_logo from "/covers/cover.jpg";
import "./Lobby.css";

const Lobby = (): React.ReactElement => {
	const navigate = useNavigate();
	const { appState } = useAppProvider();
	const { lobbyState, updateLobbyState } = useLobbyProvider();
	const { getSocket, addMsgHandler } = useSocketProvider();
	const { musicState, clearMusicState } = useMusicProvider();

	const [showContent, setShowContent] = useState<boolean>(false);
	const [lobbies, setLobbies] = useState<LobbyModel[]>([]);

	// Delay to ensure content is rendered before animation
	useEffect(() => {
		setTimeout(() => {
			setShowContent(true);
		}, 100);
	}, []);

	// Get the online lobbies
	useEffect(() => {
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
		wsSend(getSocket(), payload);
	}, []);

	// Effect to switch to chat page if the user is already joined the lobby
	useEffect(() => {
		if (lobbyState.in_lobby) {
			navigate("/chats");
		}
	}, []);

	const handleCreateLobby = async () => {
		let user_id = appState.user_id;

		// Handling the response
		addMsgHandler(OpCode.CREATE_LOBBY, (res: SocketResponse) => {
			// Tagging the user as joined in lobby
			updateLobbyState({
				lobby_id: res.value.lobby_id,
				in_lobby: true,
				is_host: true,
			});

			// Clearing the current music when creating a new lobby
			clearMusicState();

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
		wsSend(getSocket(), payload);
	};

	const handleJoinLobby = (lobby_id: string) => {
		// Join Lobby Handler
		addMsgHandler(OpCode.JOIN_LOBBY, (res: SocketResponse) => {
			// Tagging the user as joined in lobby
			updateLobbyState({
				lobby_id: res.value.lobby_id,
				in_lobby: true,
				is_host: false,
			});

			// Clearing the current music when creating a new lobby
			clearMusicState();

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
		wsSend(getSocket(), payload);
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
						<CreateLobbyButton onClick={handleCreateLobby} />
					</div>
				</div>
			</div>
		</>
	);
};

export default Lobby;
