import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchMusicList, MusicTrack } from "@/api/music/musicApi";
import { useAppProvider } from "@/providers/AppProvider";
import { fetchLikedSongs } from "@/api/music/likedSongsApi";
import { fetchTopTracks } from "@/api/music/topTracksApi";
import { fetchRecentlyPlayed } from "@/api/music/recentlyPlayedApi";
import { fetchTrendingSongs } from "@/api/music/trendingApi";
import MusicListVertical from "@/routes/allSongsPage/MusicListVertical";
import { MusicListsProvider } from "@/providers/MusicListContextProvider";

const AllSongsPage: React.FC = () => {
	const location = useLocation();
	const { appState } = useAppProvider();

	const [listTitle, setListTitle] = useState("All Songs");
	const userId = appState.user_id;

	// Function to fetch songs based on listType
	const fetchSongs = async (
		listType: string,
		userId: string,
		start_index: number,
		page_length: number,
	): Promise<MusicTrack[]> => {
		switch (listType) {
			case "Trending Now":
				return await fetchTrendingSongs(start_index, page_length);
			case "Recently Played":
				return await fetchRecentlyPlayed(userId, start_index, page_length);
			case "Liked Songs":
				return await fetchLikedSongs(userId, start_index, page_length);
			case "My Top Tracks":
				return await fetchTopTracks(userId, start_index, page_length);
			default:
				return await fetchMusicList(start_index, page_length);
		}
	};

	// Determine the listType and create a fetch function for MusicListVertical
	const listType = location.state?.listTitle || "Featured Music";
	const fetchSongsForList = async (
		start_index: number,
		page_length: number,
	) => {
		return fetchSongs(listType, userId, start_index, page_length);
	};

	return (
		<MusicListsProvider>
			<div className="p-6 bg-gray-900 min-h-screen text-white">
				<h1 className="text-3xl font-bold mb-6">{listTitle}</h1>
				<MusicListVertical fetchSongs={fetchSongsForList} />
			</div>
		</MusicListsProvider>
	);
};

export default AllSongsPage;
