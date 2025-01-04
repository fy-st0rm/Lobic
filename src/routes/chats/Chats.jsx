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

	// Leave lobby signal handler
	useEffect(() => {
		addMsgHandler(OpCode.LEAVE_LOBBY, (res) => {
			updateLobbyState("", false);
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
		<>
			<NavBar />
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
						<div className="message incoming">
							<p>Aldus PageMaker including versions of Lorem Ipsum.</p>
							<div className="timestamp">10:30 AM</div>
						</div>
						<div className="message outgoing">
							<p>I have 'em tho</p>
							<div className="timestamp">10:31 AM</div>
						</div>
						<div className="message outgoing">
							<p>I have 'em tho</p>
							<div className="timestamp">10:31 AM</div>
						</div>

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
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<MusicPlayer />
		</>
	);
}

export default Chats;
