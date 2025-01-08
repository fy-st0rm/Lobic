import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { OpCode, wsSend } from "../../const.jsx";
import { useAppState } from "../../AppState.jsx";
import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar.jsx";
import "./Chats.css";
import EmojiPicker from "emoji-picker-react";

function Chats() {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [messages, setMessages] = useState(null);

	const navigate = useNavigate();
	const { appState, ws, updateLobbyState, addMsgHandler } = useAppState();

	const users = [
		{ id: 1, name: "Coolboy", image: "/user_images/sameep.jpg" },
		{ id: 2, name: "Bhattey", image: "/user_images/manish.jpg" },
		{ id: 3, name: "SigmaBoy", image: "/user_images/dog.jpg" },
	];

	const handleUserClick = (user) => {
		setSelectedUser(user);
	};

	// Chat fetch signal handler
	useEffect(() => {
		addMsgHandler(OpCode.GET_MESSAGES, (res) => {
			console.log(res);
			setMessages(res.value);
		});

		// Fetch the chat whenever joined the lobby
		// Using timeout to wait for socket to connect
		setTimeout(() => {
			const payload = {
				op_code: OpCode.GET_MESSAGES,
				value: {
					lobby_id: appState.lobby_id,
				}
			};
			wsSend(ws, payload);
		}, 1000);
	}, []);

	// Leave lobby signal handler
	useEffect(() => {
		addMsgHandler(OpCode.LEAVE_LOBBY, (res) => {
			updateLobbyState("", false, false);
			navigate("/lobby");
		})
	}, [])

	const handleLeaveClick = () => {
		const payload = {
			op_code: OpCode.LEAVE_LOBBY,
			value: {
				lobby_id: appState.lobby_id,
				user_id: appState.user_id
			}
		};
		wsSend(ws, payload);
	};

	const handleSendMsg = () => {
		const payload = {
			op_code: OpCode.MESSAGE,
			value: {
				lobby_id: appState.lobby_id,
				user_id: appState.user_id,
				message: inputValue,
			}
		}
		wsSend(ws, payload);
		console.log(payload);
		setInputValue("");
	}

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

	const renderTextBubble = (msg) => {
		if (msg.user_id === appState.user_id) {
			return (
				<div className="message outgoing">
					<p>{msg.message}</p>
					<div className="timestamp">{msg.timestamp}</div>
				</div>
			);
		} else {
			return (
				<div className="message incoming">
					<p>{msg.message}</p>
					<div className="timestamp">{msg.timestamp}</div>
				</div>
			);
		}
	}

	return (
		<>
			<div className="chats-page">
				<div className="main-content">
					{/* Sidebar */}
					<div className="sidebar">
						<div className="sidebar-header">
							<div className="sidebar-title">Lobblers</div>
						</div>
						<div className="user-list">
							{users.map((user) => (
								<div
									key={user.id}
									className={`user-item ${selectedUser?.id === user.id ? "selected" : ""}`}
									onClick={() => handleUserClick(user)}
								>
									<img src={user.image} alt={user.name} className="user-image" />
									<span className="user-name">{user.name}</span>
								</div>
							))}
						</div>
					</div>

					{/* Chat Container */}
					<div className="chat-container">
						{/* Chat Header */}
						<div className="chat-header">
							{selectedUser ? (
								<div className="chat-header-user">
									<img src={selectedUser.image} alt={selectedUser.name} className="chat-header-image" />
									<span className="chat-header-name">{selectedUser.name}</span>
								</div>
							) : (
								<span>Select a user to chat</span>
							)}
							<button className="leave-lobby" onClick={handleLeaveClick}>
								<img src="/chats/leave.svg" alt="Leave Lobby" className="leave-lobby-icon" />
							</button>
						</div>

						{/* Messages */}
						{
							messages && messages.map((text, idx) => renderTextBubble(text))
						}

						{/* Type Box */}
						<div className="type-box-container">
							<button className="emoji-button" onClick={toggleEmojiPicker}>
								<img src="/chats/emoji.svg" alt="Emoji Button" className="emoji-button-icon" />
							</button>
							{showEmojiPicker && (
								<div className="emoji-picker">
									<EmojiPicker onEmojiClick={onEmojiClick} />
								</div>
							)}
							<button
								className="image-input"
								onClick={() => document.getElementById("fileInput").click()}
							>
								<img src="/chats/images.svg" alt="Image Input" className="image-input-icon" />
							</button>
							<input
								id="fileInput"
								type="file"
								accept="image/*,application/pdf"
								style={{ display: "none" }}
								multiple
								onChange={handleFileSelect}
							/>
							<div className="type-box">
								<input
									type="text"
									placeholder="Type your message..."
									className="type-field"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSendMsg();
										}
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Chats;
