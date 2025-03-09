// Node modules
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Locals
import { OpCode, wsSend, SocketResponse, SocketPayload } from "api/socketApi";
import { LobbyModel, fetchLobbies } from "api/lobbyApi";
import { LobbyCard, CreateLobbyButton } from "./LobbyCard";
import { useAppProvider } from "providers/AppProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useMusicProvider } from "providers/MusicProvider";
import { useSidebarState } from "@/components/SideBar/SideBar";

// Assets
import "commons/style.css";

const Lobby = (): React.ReactElement => {
	const navigate = useNavigate();
	const { appState } = useAppProvider();
	const { lobbyState, updateLobbyState } = useLobbyProvider();
	const { getSocket, addMsgHandler } = useSocketProvider();
	const { musicState, clearMusicState } = useMusicProvider();
	const { isExtended } = useSidebarState();

	const [lobbies, setLobbies] = useState<LobbyModel[]>([]);

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
			value: {
				user_id: appState.user_id
			},
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
			<div>
				<h1 className="font-bold text-3xl text-primary_fg pl-5"> Lobby </h1>
				<div className="overflow-auto no-scrollbar">
					<div
						className="
							grid
							grid-cols-[repeat(auto-fill,_minmax(170px,_1fr))]
							grid-rows-[repeat(auto-fill,_minmax(250px,_1fr))]
							w-[90%] 
							gap-2
							px-5
					"
					>
						{lobbies.map((lobby, idx) => (
							<LobbyCard
								key={lobby.id}
								lobby_id={lobby.id}
								lobby_name={lobby.lobby_name}
								lobby_icon={lobby.lobby_icon}
								listeners_cnt={lobby.listeners}
								song_name={lobby.song_name}
								artist_name={lobby.artist_name}
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
