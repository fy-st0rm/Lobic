import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Play } from "lucide-react";
import { MusicTrack as Song, MPState } from "@/api/music/musicApi";
import { useAppProvider } from "providers/AppProvider";
import { useQueueProvider } from "providers/QueueProvider";
import { useMusicProvider, MusicState } from "providers/MusicProvider";
import { fetchLikedSongs, toggleSongLiked } from "@/api/music/likedSongsApi";
import {
	addSongToPlaylist,
	fetchUserPlaylists,
} from "@/api/playlist/playlistApi";
import { fetchMusicList } from "@/api/music/musicApi";
import SongItem from "./SongItem";
import { MusicListsProvider } from "@/providers/MusicListContextProvider";
import { fetchRecentlyPlayed } from "@/api/music/recentlyPlayedApi";
import { fetchTopTracks } from "@/api/music/topTracksApi";
import { fetchTrendingSongs } from "@/api/music/trendingApi";

// MusicListVertical Component to handle the display and interaction with music items
interface MusicListVerticalProps {
	fetchSongs: (start_index: number, page_length: number) => Promise<Song[]>;
	initialSongs?: Song[];
}

const MusicListVertical: React.FC<MusicListVerticalProps> = ({
	fetchSongs,
	initialSongs = [],
}) => {
	const [songs, setSongs] = useState<Song[]>(initialSongs);
	const [isLoading, setIsLoading] = useState(false);
	const [startIndex, setStartIndex] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
	const pageLength = 20;

	const { appState } = useAppProvider();
	const userId = appState.user_id;
	const { enqueue, clearQueue } = useQueueProvider();
	const { clearMusicState, updateMusicState } = useMusicProvider();

	// Load initial songs
	const loadInitialSongs = async () => {
		setIsLoading(true);
		try {
			const fetchedSongs = await fetchSongs(0, pageLength);
			setSongs(fetchedSongs);
			setStartIndex(pageLength);
			setHasMore(fetchedSongs.length === pageLength);
		} catch (error) {
			console.error("Error fetching initial songs:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadInitialSongs();
	}, []);

	const loadMoreSongs = useCallback(async () => {
		if (isLoading || !hasMore) return;
		setIsLoading(true);
		try {
			const newSongs = await fetchSongs(startIndex, pageLength);
			if (newSongs.length > 0) {
				setSongs((prev) => [...prev, ...newSongs]);
				setStartIndex((prev) => prev + newSongs.length);
				setHasMore(newSongs.length === pageLength);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Error fetching more songs:", error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchSongs, startIndex, isLoading, hasMore]);

	// Infinite scroll handler
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
			const scrollThreshold = 80; //measured in px from the buttom

			if (scrollHeight - scrollTop <= clientHeight + scrollThreshold) {
				loadMoreSongs();
			}
		},
		[loadMoreSongs],
	);

	const handleSongPlay = useCallback(
		async (song: Song) => {
			setSelectedSongId(song.id);
			clearMusicState();
			clearQueue();
			updateMusicState({
				id: song.id,
				title: song.title,
				artist: song.artist,
				image_url: song.image_url,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
		},
		[clearMusicState, clearQueue, updateMusicState],
	);

	const handleAddToQueue = useCallback(
		(song: Song) => {
			enqueue(song);
		},
		[enqueue],
	);

	const handleAddToLikedSongs = useCallback(
		async (song: Song) => {
			try {
				await toggleSongLiked(appState.user_id, song.id);
			} catch (error) {
				console.error("Error adding to liked songs:", error);
			}
		},
		[appState.user_id],
	);

	const handleAddToPlaylist = useCallback(
		async (song: Song) => {
			try {
				const response = await fetchUserPlaylists(appState.user_id);
				if (response.playlists.length === 0) return;

				await addSongToPlaylist({
					playlist_id: response.playlists[0].playlist_id,
					music_id: song.id,
					song_adder_id: userId,
				});
			} catch (error) {
				console.error("Error adding song to playlist:", error);
			}
		},
		[appState.user_id],
	);

	const playAllSongs = () => {
		if (songs.length === 0) return;
		clearMusicState();
		clearQueue();
		handleSongPlay(songs[0]);
		songs.slice(1).forEach((song) => enqueue(song));
	};

	return (
		<div className="flex flex-col h-[80vh] transition-all">
			<div className="fixed top-[115px] w-full bg-primary z-10">
				<button
					onClick={playAllSongs}
					className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
				>
					<Play className="h-5 w-5" />
					Play All
				</button>
			</div>
			<div
				className="flex-1 overflow-x-auto overflow-y-auto w-screen mt-[115px] scrollbar-hidden scrollbar-thin touch-none"
				onScroll={handleScroll}
				style={{
					overscrollBehavior: "contain",
				}}
			>
				{songs.map((song) => (
					<SongItem
						key={song.id}
						song={song}
						isSelected={selectedSongId === song.id}
						onPlay={handleSongPlay}
						onAddToQueue={handleAddToQueue}
						onAddToLikedSongs={handleAddToLikedSongs}
						onAddToPlaylist={handleAddToPlaylist}
					/>
				))}
			</div>
		</div>
	);
};

// AllSongsPage Component to manage fetching and passing songs to MusicListVertical
const AllSongsPage: React.FC = () => {
	const location = useLocation();
	const { appState } = useAppProvider();
	const userId = appState.user_id;

	const fetchSongs = async (
		start_index: number = 0,
		page_length: number = 10,
	): Promise<Song[]> => {
		const listType = location.state?.listTitle || "Featured Music";
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

	return (
		<MusicListsProvider>
			<div className="p-6 min-h-screen text-white">
				<MusicListVertical fetchSongs={fetchSongs} />
			</div>
		</MusicListsProvider>
	);
};

export default AllSongsPage;
