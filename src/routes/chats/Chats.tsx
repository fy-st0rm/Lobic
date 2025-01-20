// Node Modules
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

// Local
import { MPState } from "api/musicApi";
import { User } from "api/userApi";
import { OpCode, wsSend, SocketResponse } from "api/socketApi";
import MusicPlayer from "components/MusicPlayer/MusicPlayer";
import NavBar from "components/NavBar/NavBar";
import { useAppProvider } from "providers/AppProvider";
import { useMusicProvider } from "providers/MusicProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useSocketProvider } from "providers/SocketProvider";

type Message = {
	user_id: string,
	message: string,
	timestamp: string,
};

function Chats(): React.ReactElement {
	const { appState } = useAppProvider();
	const { lobbyState, updateLobbyState } = useLobbyProvider();
	const { musicState, updateMusicState } = useMusicProvider();
	const { getSocket, addMsgHandler } = useSocketProvider();
	const navigate = useNavigate();

	const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
	const [inputValue, setInputValue] = useState<string>("");
	const [selectedUser, setSelectedUser] = useState<User>({
		id: "", username: "", email: "", pfp: ""
	});
	const [messages, setMessages] = useState<Message[]>([]);

	const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for the chat container

	const users: User[] = [
		{ id: "1", username: "Coolboy",  email: "asd@gmail.com", pfp: "/user_images/sameep.jpg" },
		{ id: "2", username: "Bhattey",  email: "asd@gmail.com", pfp: "/user_images/manish.jpg" },
		{ id: "3", username: "SigmaBoy", email: "asd@gmail.com", pfp: "/user_images/dog.jpg"		},
	];

	const handleUserClick = (user: User) => setSelectedUser(user);

	useEffect(() => {
		addMsgHandler(OpCode.GET_MESSAGES, (res: SocketResponse) => {
			setMessages(res.value);
		});

		setTimeout(() => {
			const payload = {
				op_code: OpCode.GET_MESSAGES,
				value: { lobby_id: lobbyState.lobby_id },
			};
			wsSend(getSocket(), payload);
		}, 1000);
	}, []);

	// Scroll to the bottom of the chat whenever messages change
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [messages]);

	useEffect(() => {
		addMsgHandler(OpCode.SYNC_MUSIC, (res: SocketResponse) => {
			let music = res.value;

			updateMusicState({
				id: music.id,
				title: music.title,
				artist: music.artist,
				cover_img: music.cover_img,
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

	useEffect(() => {
		addMsgHandler(OpCode.LEAVE_LOBBY, (res: SocketResponse) => {
			// Tagging the user as joined in lobby
			updateLobbyState({
				lobby_id: null,
				in_lobby: false,
				is_host: false,
			});

			// Clearing the current music when leaving lobby
			updateMusicState({
				id: null,
				title: null,
				artist: null,
				cover_img: null,
				state: MPState.EMPTY,
				state_data: 0,
			});

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

	const toggleEmojiPicker = () => {
		setShowEmojiPicker(!showEmojiPicker);
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
			className="fixed inset-0 flex items-center justify-center p-4"
			style={{ top: "80px", bottom: "calc(67px + 1px)" }}
		>
			<div className="flex w-full h-full gap-4 px-0.1">
				{/* Sidebar */}
				<div className="w-80 bg-black/60 rounded-lg overflow-hidden flex flex-col">
					<div className="p-4 bg-black/20">
						<span className="text-white font-bold text-xl">Lobblers</span>
					</div>
					<div className="flex-1 overflow-y-auto">
						<div className="p-2 space-y-2">
							{users.map((user) => (
								<div
									key={user.id}
									onClick={() => handleUserClick(user)}
									className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
										${selectedUser?.id === user.id ? "bg-white/40" : "hover:bg-white/20"}`}
								>
									<img
										src={user.pfp}
										alt={user.username}
										className="w-10 h-10 rounded-full mr-3 object-cover"
									/>
									<span className="text-white font-medium">{user.username}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Chat Container */}
				<div className="flex-1 bg-white/60 rounded-lg overflow-hidden flex flex-col">
					{/* Chat Header */}
					<div className="bg-black/90 px-4 py-3 flex items-center justify-between">
						{selectedUser ? (
							<div className="flex items-center gap-3">
								<img
									src={selectedUser.pfp}
									alt={selectedUser.username}
									className="w-8 h-8 rounded-full object-cover"
								/>
								<span className="text-white font-bold">
									{selectedUser.username}
								</span>
							</div>
						) : (
							<span className="text-white">Select a user to chat</span>
						)}
						<button
							onClick={handleLeaveClick}
							className="text-white hover:opacity-80 bg-transparent border-none"
						>
							<img src="/chats/leave.svg" alt="Leave" className="w-6 h-6" />
						</button>
					</div>

					{/* Messages Area */}
					<div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
						{messages?.map((msg, idx) => (
							<div
								key={idx}
								className={`flex mb-4 ${msg.user_id === appState.user_id ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`px-4 py-2 rounded-2xl inline-block ${
										msg.user_id === appState.user_id
											? "bg-green-100 rounded-br-none text-right"
											: "bg-blue-50 rounded-bl-none text-left"
									}`}
									style={{
										maxWidth: "60%",
										wordBreak: "break-word",
									}}
								>
									<p className="mb-1">{msg.message}</p>
									<div className="text-xs text-gray-500">{msg.timestamp}</div>
								</div>
							</div>
						))}
					</div>

					{/* Input Area */}
					<div className="p-4 border-t border-gray-200 bg-white/80">
						<div className="relative flex items-center">
							<button
								onClick={() => setShowEmojiPicker(!showEmojiPicker)}
								className="absolute left-3 text-gray-500 hover:text-gray-700 bg-transparent border-none"
							>
								<img src="/chats/emoji.svg" alt="Emoji" className="w-5 h-5" />
							</button>
							{showEmojiPicker && (
								<div className="absolute bottom-full left-0 mb-2">
									<EmojiPicker onEmojiClick={handleEmojiClick} />
								</div>
							)}
							<input
								type="text"
								placeholder="Type your message..."
								className="w-full pl-12 pr-12 py-2 rounded-full border border-black-300 focus:border-black-400"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSendMsg()}
							/>
							<button
								onClick={() => {
									let fileInput = document.getElementById("fileInput");
									if (fileInput) fileInput.click();
								}}
								className="absolute right-3 text-gray-500 hover:text-gray-700 bg-transparent border-none"
							>
								<img src="/chats/images.svg" alt="Upload" className="w-5 h-5" />
							</button>
							<input
								id="fileInput"
								type="file"
								accept="image/*,application/pdf"
								className="hidden"
								multiple
								onChange={handleFileSelect}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Chats;
