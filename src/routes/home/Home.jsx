import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAppState } from "../../AppState.jsx";
import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
// import AudioPlayer from '../../components/MusicPlayer/AudioPlayer';
import NavBar from "../../components/NavBar/NavBar.jsx"
import MusicList from "../../components/MusicList/MusicList.jsx"

function Home() {
	const { appState }= useAppState();
	console.log("From HOME:", appState);

	return (
		<>
			<NavBar />
			<MusicList />
			<MusicPlayer />
			{/* <AudioPlayer/> */}
		</>
	);

}

export default Home;
