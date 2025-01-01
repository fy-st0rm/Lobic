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
                </div>
                <div className="chat-container">
                    {/* Content for the white main area */}
                </div>
            </div>
            </div>
            <MusicPlayer />
            </>
    );
}

export default Chats;