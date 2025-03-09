//Chats.tsx
// Node Modules
import { useNavigate } from "react-router-dom";
import React, { FC, useState, useEffect, useRef, RefObject } from "react";

// Local
import { MPState } from "@/api/music/musicApi";
import { User, getUserData, fetchUserProfilePicture } from "@/api/user/userApi";
import { OpCode, wsSend, SocketResponse } from "api/socketApi";
import { LobbyModel, fetchLobby } from "api/lobbyApi";
import MusicPlayer from "components/MusicPlayer/MusicPlayer";
import NavBar from "components/NavBar/NavBar";
import { useAppProvider } from "providers/AppProvider";
import { useMusicProvider } from "providers/MusicProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useQueueProvider } from "providers/QueueProvider";
import { useSidebarState } from "components/SideBar/SideBar"; // Import the sidebar context

import { LobbyMembers, LobblersArea } from "./LobblersArea";
import { Message, MessageArea } from "./MessageArea";
import { InputArea } from "./InputArea";

// Assets
import crown from "/chats/crown.svg";

function Chats(): React.ReactElement {
	const { appState } = useAppProvider();
	const { lobbyState, updateLobbyState } = useLobbyProvider();
	const { musicState, updateMusicState, clearMusicState } = useMusicProvider();
	const { getSocket, addMsgHandler } = useSocketProvider();
	const { updateQueue, clearQueue } = useQueueProvider();
	const { isExtended } = useSidebarState(); // Get the sidebar state
	const navigate = useNavigate();

	const [lobby, setLobby] = useState<LobbyModel|null>(null);
	const [inputValue, setInputValue] = useState<string>("");
	const [users, setUsers] = useState<LobbyMembers>({});
	const [selectedUser, setSelectedUser] = useState<User>({
		id: "",
		username: "",
		email: "",
		pfp: "",
	});
	const [messages, setMessages] = useState<Message[]>([]);

	// Ref for the chat container
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const handleUserClick = (user: User) => setSelectedUser(user);

	// Responsible to get lobby datas
	useEffect(() => {
		const init = async () => {
			if (!lobbyState.lobby_id) return;
			let lobbyModel = await fetchLobby(lobbyState.lobby_id);
			setLobby(lobbyModel);
		};
		init();
	}, []);

	// Responsible to collect the incoming messages
	useEffect(() => {
		addMsgHandler(OpCode.GET_MESSAGES, (res: SocketResponse) => {
			setMessages(res.value);
		});

		// Fetches the messages once when entering the lobby
		const payload = {
			op_code: OpCode.GET_MESSAGES,
			value: { lobby_id: lobbyState.lobby_id },
		};
		wsSend(getSocket(), payload);
	}, []);

	// Responsible to collect the members of the lobby
	useEffect(() => {
		addMsgHandler(OpCode.GET_LOBBY_MEMBERS, (res: SocketResponse) => {
			const prepare_users = async () => {
				let user_ids = res.value;
				let users: LobbyMembers = {};
				for (let x of user_ids) {
					let user = await getUserData(x);
					user.pfp = await fetchUserProfilePicture(x);
					users[user.id] = user;
				}
				setUsers(users);
			};
			prepare_users();
		});

		// Fetches the members once when entering the lobby
		const payload = {
			op_code: OpCode.GET_LOBBY_MEMBERS,
			value: { lobby_id: lobbyState.lobby_id },
		};
		wsSend(getSocket(), payload);
	}, []);

	// Responsible to sync queue in lobby
	useEffect(() => {
		addMsgHandler(OpCode.SYNC_QUEUE, (res: SocketResponse) => {
			console.log(res.value);
			updateQueue(res.value);
		});

		const payload = {
			op_code: OpCode.SYNC_QUEUE,
			value: {
				lobby_id: lobbyState.lobby_id,
			},
		};
		wsSend(getSocket(), payload);
	}, []);

	// Scroll to the bottom of the chat whenever messages change
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [messages]);

	// Responsible to sync music with the host of the lobby
	useEffect(() => {
		addMsgHandler(OpCode.SYNC_MUSIC, (res: SocketResponse) => {
			let music = res.value;

			updateMusicState({
				id: music.id,
				title: music.title,
				artist: music.artist,
				image_url: music.image_url,
			});

			if (
				music.state === MPState.CHANGE_MUSIC ||
				music.state === MPState.PLAY ||
				music.state === MPState.PAUSE
			) {
				updateMusicState({
					state: music.state,
					state_data: music.timestamp,
				});
			} else if (music.state === MPState.CHANGE_TIME) {
				updateMusicState({
					state: music.state,
					state_data: music.timestamp,
				});
			} else if (music.state === MPState.CHANGE_VOLUME) {
				// Ignore this state
			}
		});

		// Fetches the current state of music in lobby once while entering the lobby
		if (!lobbyState.in_lobby) return;
		const payload = {
			op_code: OpCode.SYNC_MUSIC,
			value: {
				lobby_id: lobbyState.lobby_id,
				current_state: musicState.state,
			},
		};
		wsSend(getSocket(), payload);
	}, []);

	// Responsible to handle signal of LEAVE_LOBBY
	useEffect(() => {
		addMsgHandler(OpCode.LEAVE_LOBBY, (res: SocketResponse) => {
			// Tagging the user as joined in lobby
			updateLobbyState({
				lobby_id: null,
				in_lobby: false,
				is_host: false,
			});

			// Clearing the current music when leaving lobby
			clearMusicState();
			clearQueue();

			navigate("/lobby");
		});
	}, []);

	const handleLeaveClick = () => {
		wsSend(getSocket(), {
			op_code: OpCode.LEAVE_LOBBY,
			value: {
				lobby_id: lobbyState.lobby_id,
				user_id: appState.user_id,
			},
		});
	};

	const handleSendMsg = () => {
		if (!inputValue.trim()) return;

		wsSend(getSocket(), {
			op_code: OpCode.MESSAGE,
			value: {
				lobby_id: lobbyState.lobby_id,
				user_id: appState.user_id,
				message: inputValue,
			},
		});
		setInputValue("");
	};

	const handleInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const handleEmojiClick = (emojiObject: { emoji: string }) => {
		setInputValue((prev) => prev + emojiObject.emoji);
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		const fileNames = files.map((file) => file.name).join(", ");
		setInputValue(fileNames);
	};

	return (
		<div
	className=" inset-0 flex items-center justify-center transition-all h-full"
	style={{
// Ensure no gap at the top
		bottom: "calc(67px + 1px)", // Adjust bottom as needed// Adjust for sidebar
		marginTop: "0", // Remove any unintended top margin
		paddingTop: "1px", // Prevent collapsing margins
		boxSizing: "border-box", // Ensure consistent box model
	}}
		>
			<div className="flex w-full h-full gap-2">
				{/* Lobblers Area - narrower when sidebar is extended */}
				<div className={`${isExtended ? 'w-16' : 'w-80'} transition-all`}>
					<LobblersArea
						users={users}
						selectedUser={selectedUser}
						handleUserClick={handleUserClick}
						isExtended={isExtended}
					/>
				</div>

				{/* Chat Container - takes more space when sidebar is extended */}
				<div className="flex-1 bg-white/60 rounded-lg overflow-hidden flex flex-col">
					{/* Chat Header */}
					<div className="bg-darker px-4 pt-3 pb-4 flex items-center justify-between">
						{lobby ? (
						<div className="flex items-center gap-3">
							<span className="text-white font-bold">
								{`${lobby.lobby_name}`}
							</span>
						</div>
						) : (
						<span className="text-white">Lobby</span>
						)}
						<button
							onClick={handleLeaveClick}
							className="text-white hover:opacity-80 bg-transparent border-none"
							>
						<img src="/chats/leave.svg" alt="Leave" className="w-6 h-6" />
						</button>
					</div>

					{/* Messages Area */}
					<MessageArea
						currentUserId={appState.user_id}
						messages={messages}
						users={users}
						chatContainerRef={chatContainerRef}
					/>

					{/* Input Area */}
					<InputArea
						inputValue={inputValue}
						handleInputValue={handleInputValue}
						handleEmojiClick={handleEmojiClick}
						handleSendMsg={handleSendMsg}
						handleFileSelect={handleFileSelect}
					/>
				</div>
			</div>
		</div>
	);
}

export default Chats;
