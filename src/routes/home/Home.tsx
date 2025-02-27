import React from "react";
import MusicList from "@/routes/home/MusicList";
import { MusicListsProvider } from "@/providers/MusicListContextProvider";

function Home() {
	return (
		<MusicListsProvider>
			<div className="overflow-auto no-scrollbar my-5 mx-2">
				<MusicList list_title="Liked Songs" />
				<MusicList list_title="Featured Music" />
				<MusicList list_title="Recently Played" />
				<MusicList list_title="Trending Now" />
				<MusicList list_title="My Top Tracks" />
			</div>
		</MusicListsProvider>
	);
}

export default React.memo(Home);
