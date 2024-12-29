import { useNavigate } from "react-router-dom";

import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";

function Home() {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate("/lobby");
	}

	return (
		<>
			<button onClick={handleClick}>
				Lobby
			</button>
			<MusicPlayer />
		</>
	);

}

export default Home
