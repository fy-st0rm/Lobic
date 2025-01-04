import { useNavigate } from "react-router-dom";

import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar.jsx"
import MusicList from "../../components/MusicList/MusicList.jsx"
import './Home.css'

function Home() {

	return (
		<>
		<div className="home-container">
			<NavBar />
			<div className="scrollable-area">
			<MusicList />
			<MusicList />
			<MusicList />
			<MusicList />
			</div>


			<MusicPlayer />
		</div>
			
		</>
	);

}

export default Home;
