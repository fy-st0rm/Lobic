import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { OpCode, wsSend, MPState } from "../../const.jsx";
import { useAppState } from "../../AppState.jsx";
import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar.jsx";

function Chats() {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [messages, setMessages] = useState(null);

	const chatContainerRef = useRef(null); // Ref for the chat container
	const navigate = useNavigate();
	const {
		ws,
		audioRef,
		appState,
		musicState,
		addMsgHandler,
		updateMusicData,
		updateLobbyState,
	} = useAppState();

	const users = [
		{ id: 1, name: "Coolboy", image: "/user_images/sameep.jpg" },
		{ id: 2, name: "Bhattey", image: "/user_images/manish.jpg" },
		{ id: 3, name: "SigmaBoy", image: "/user_images/dog.jpg" },
	];

	const handleUserClick = (user) => setSelectedUser(user);

	useEffect(() => {
		addMsgHandler(OpCode.GET_MESSAGES, (res) => {
			setMessages(res.value);
		});

		setTimeout(() => {
			const payload = {
				op_code: OpCode.GET_MESSAGES,
				value: { lobby_id: appState.lobby_id },
			};
			wsSend(ws, payload);
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
		addMsgHandler(OpCode.SYNC_MUSIC, (res) => {
			let music = res.value;
			updateMusicData(
				music.id,
				music.title,
				music.artist,
				music.cover_img,
				music.timestamp,
				music.state,
			);

			if (audioRef.current) {
				audioRef.current.currentTime = music.timestamp;
			}
		});

		if (!appState.in_lobby) return;

		const payload = {
			op_code: OpCode.SYNC_MUSIC,
			value: {
				lobby_id: appState.lobby_id,
			},
		};
		wsSend(ws, payload);
	}, []);

	useEffect(() => {
		addMsgHandler(OpCode.LEAVE_LOBBY, (res) => {
			updateLobbyState("", false, false);

			// Clearning the current music when leaving a lobby
			updateMusicData("", "", "", "", 0, MPState.PAUSE);

			navigate("/lobby");
		});
	}, []);

	const handleLeaveClick = () => {
		wsSend(ws, {
			op_code: OpCode.LEAVE_LOBBY,
			value: {
				lobby_id: appState.lobby_id,
				user_id: appState.user_id,
			},
		});
	};

	const handleSendMsg = () => {
		if (!inputValue.trim()) return;

		wsSend(ws, {
			op_code: OpCode.MESSAGE,
			value: {
				lobby_id: appState.lobby_id,
				user_id: appState.user_id,
				message: inputValue,
			},
		});
		setInputValue("");
	};

	const toggleEmojiPicker = () => {
		setShowEmojiPicker(!showEmojiPicker);
	};

	const onEmojiClick = (emojiObject) => {
		setInputValue((prev) => prev + emojiObject.emoji);
	};

	const handleFileSelect = (event) => {
		const files = Array.from(event.target.files);
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
										src={user.image}
										alt={user.name}
										className="w-10 h-10 rounded-full mr-3 object-cover"
									/>
									<span className="text-white font-medium">{user.name}</span>
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
									src={selectedUser.image}
									alt={selectedUser.name}
									className="w-8 h-8 rounded-full object-cover"
								/>
								<span className="text-white font-bold">
									{selectedUser.name}
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
								className={`max-w-[60%] mb-4 ${
									msg.user_id === appState.user_id ? "ml-auto" : ""
								}`}
							>
								<div
									className={`px-4 py-2 rounded-2xl ${
										msg.user_id === appState.user_id
											? "bg-green-100 rounded-br-none"
											: "bg-blue-50 rounded-bl-none"
									}`}
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
									<EmojiPicker
										onEmojiClick={(emojiObject) =>
											setInputValue((prev) => prev + emojiObject.emoji)
										}
									/>
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
								onClick={() => document.getElementById("fileInput").click()}
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
								onChange={(e) => {
									const files = Array.from(e.target.files);
									setInputValue(files.map((file) => file.name).join(", "));
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Chats;
