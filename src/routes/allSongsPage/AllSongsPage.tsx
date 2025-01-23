import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
	fetchTrendingSongs,
	fetchRecentlyPlayed,
	fetchMusicList,
	MusicTrack,
} from "@/api/musicApi";
import { useAppProvider } from "@/providers/AppProvider";
import { fetchLikedSongs } from "@/api/likedSongsApi";
import { fetchTopTracks } from "@/api/topTracksApi";

const AllSongsPage: React.FC = () => {
	const location = useLocation();
	const { appState } = useAppProvider();

	const [listTitle, setListTitle] = useState("All Songs");
	const [songs, setSongs] = useState<MusicTrack[]>([]);

	const userId = appState.user_id;
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

	useEffect(() => {
		const loadSongs = async () => {
			try {
				const listType = location.state?.listTitle || "Featured Music";
				setListTitle(listType);

				// Fetch songs using the fetchSongs function
				const fetchedSongs = await fetchSongs(listType, userId, 0, 10);
				setSongs(fetchedSongs);

				console.log(fetchedSongs);
			} catch (error) {
				console.error("Error fetching songs:", error);
			}
		};

		loadSongs();
	}, [location.state?.listTitle, userId]);

	return (
		<div>
			<h1>{listTitle}</h1>
			{/* Render the songs here */}
			{songs.map((song) => (
				<div key={song.id}>{song.title}</div>
			))}
		</div>
	);
};

export default AllSongsPage;
