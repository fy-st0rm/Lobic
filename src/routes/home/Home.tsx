import React from "react";
import MusicList from "components/MusicList/MusicList";
import "./Home.css";

function Home() {
	return (
		<>
			<div className="home-container">
				<div className="scrollable-area">
					<MusicList list_title="Liked Songs" renderOnlyOnSuccess={true} />
					<MusicList list_title="Featured Music" renderOnlyOnSuccess={false} />
					<MusicList list_title="Recently Played" renderOnlyOnSuccess={true} />
					<MusicList list_title="Trending Now" renderOnlyOnSuccess={false} />
					<MusicList list_title="My Top Tracks" renderOnlyOnSuccess={false} />
				</div>
			</div>
		</>
	);
}

export default Home;