import { useNavigate } from "react-router-dom";

import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar.jsx"

function Home() {

	return (
		<>
			<NavBar />
			<MusicList />
			<MusicPlayer />
		</>
	);

}

export default Home;
