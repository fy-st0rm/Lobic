import React from "react";
import MusicList from "@/routes/home/MusicList";
import { MusicListsProvider } from "@/providers/MusicListContextProvider";
import "./Home.css";

function Home() {
	return (
		<MusicListsProvider>
			<div className="home-container">
				<div className="scrollable-area">
					<MusicList list_title="Liked Songs" />
					<MusicList list_title="Featured Music" />
					<MusicList list_title="Recently Played" />
					<MusicList list_title="Trending Now" />
					<MusicList list_title="My Top Tracks" />
				</div>
			</div>
		</MusicListsProvider>
	);
}

export default React.memo(Home);
