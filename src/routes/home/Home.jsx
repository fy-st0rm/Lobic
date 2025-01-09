import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar.jsx";
import MusicList from "../../components/MusicList/MusicList.jsx";
import SongContainer from "../../components/SongContainer/SongContainer.jsx";
import './Home.css';

function Home() {
	return (
		<>
			<div className="home-container">
				<div className="scrollable-area">
					<MusicList className="music-list" list_title="Featured Music" />
					<MusicList className="music-list" list_title="Recently Played" />
					<MusicList className="music-list" list_title="Trending Now" />
				</div>
			</div>
		</>
	);
}

export default Home;
