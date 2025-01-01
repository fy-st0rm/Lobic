import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar.jsx";
import "./Chats.css";
import EmojiPicker from "emoji-picker-react";

function Chats() {
    const navigate = useNavigate();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);

    
    const handleClick = () => {
        navigate("/lobby");
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const onEmojiClick = (emojiObject) => {
        setInputValue((prev) => prev + emojiObject.emoji);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const fileNames = files.map((file) => file.name).join(", "); // Combine file names
        setInputValue(fileNames); // Set file names as the input value
    };

    return (
        <>
            <NavBar />
            <div className="chats-page">
            <div className="main-content">
                <div className="sidebar">
                    {/* Content for the green sidebar */}
                    <div className="sidebar-header">
                        <div className="sidebar-title">Lobblers</div>
                    </div>
                </div>
                <div className="chat-container">
                    {/* Content for the white main area */}
                    <div className="chat-header">
                        <button className="leave-lobby" onClick={handleClick}>
                            <img src="/chats/leave.svg" alt="Leave Lobby" className="leave-lobby-icon" />
                        </button>
                    </div>
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
                                multiple // Allow multiple file selection
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
