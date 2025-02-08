import React from "react";
import MusicList from "@/routes/home/MusicList";
import { MusicListsProvider } from "@/providers/MusicListContextProvider";
import "./Home.css";
import {useSidebarState} from "@/components/SideBar/SideBar";

function Home() {
	const { isExtended } = useSidebarState();

	return (
	  <MusicListsProvider>
		<div className={`home-container relative transition-all ${
		  isExtended ? 'w-[86vw] left-[13vw]' : 'w-[93vw] left-[6vw]'
		}`}>
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
