import { useNavigate } from "react-router-dom";
import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/Navbar.jsx";
import "./Chats.css";

function Chats() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate("/lobby");
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
                    <div className="chat-header"></div>
                    <div className="type-box-container">
                        <div className="type-box">
                            <input
                            type="text"
                            placeholder="Type your message..."
                            className="type-field"
                            // disabled={isDisabled}
                            // style={{ pointerEvents: isDisabled ? "none" : "auto" }}
                            // value={inputValue}
                            // onChange={handleInputChange}
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