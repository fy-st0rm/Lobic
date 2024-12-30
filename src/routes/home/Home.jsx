import { useNavigate } from "react-router-dom";

import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/Navbar.jsx"

function Home() {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate("/lobby");
	}

	return (
		<>
			<NavBar />
			<MusicPlayer />
		</>
	);

}

export default Home
