import MusicList from "../../components/MusicList/MusicList.jsx";
import "./Home.css";

function Home() {
	return (
		<>
			<div className="home-container">
				<div className="scrollable-area">
					<MusicList className="music-list" list_title="Liked Songs" renderOnlyOnSuccess={true} />
					<MusicList className="music-list" list_title="Featured Music" />
					<MusicList className="music-list" list_title="Recently Played" renderOnlyOnSuccess={true} />
					<MusicList className="music-list" list_title="Trending Now" />
					<MusicList className="music-list" list_title="My Top Tracks" />
				</div>
			</div>
		</>
	);
}

export default Home;