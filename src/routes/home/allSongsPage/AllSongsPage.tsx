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

// PlayAllButton Component
const PlayAllButton: React.FC<{ onPlayAll: () => void }> = ({ onPlayAll }) => (
	<div className=" w-full bg-primary">
		<button onClick={onPlayAll} className="flex items-center rounded-full">
			<Play className="h-5 w-5" />
			Play All
		</button>
	</div>
);

// ScrollableSongList Component
const ScrollableSongList: React.FC<{
	songs: Song[];
	selectedSongId: string | null;
	onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
	onPlay: (song: Song) => void;
	onAddToQueue: (song: Song) => void;
	onAddToLikedSongs: (song: Song) => void;
	onAddToPlaylist: (song: Song) => void;
}> = ({
	songs,
	selectedSongId,
	onScroll,
	onPlay,
	onAddToQueue,
	onAddToLikedSongs,
	onAddToPlaylist,
}) => (
	<div onScroll={onScroll}>
		{songs.map((song) => (
			<SongItem
				key={song.id}
				song={song}
				isSelected={selectedSongId === song.id}
				onPlay={onPlay}
				onAddToQueue={onAddToQueue}
				onAddToLikedSongs={onAddToLikedSongs}
				onAddToPlaylist={onAddToPlaylist}
			/>
		))}
	</div>
);

// AllSongsPage Component with merged MusicListVertical logic
const AllSongsPage: React.FC = () => {
	const [songs, setSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [startIndex, setStartIndex] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
	const pageLength = 20;

	const location = useLocation();
	const { appState } = useAppProvider();
	const { enqueue, clearQueue } = useQueueProvider();
	const { clearMusicState, updateMusicState } = useMusicProvider();

	// Fetch songs based on list type
	const fetchSongs = async (start_index: number, page_length: number) => {
		const listType = location.state?.listTitle || "Featured Music";
		switch (listType) {
			case "Trending Now":
				return await fetchTrendingSongs(start_index, page_length);
			case "Recently Played":
				return await fetchRecentlyPlayed(
					appState.user_id,
					start_index,
					page_length,
				);
			case "Liked Songs":
				return await fetchLikedSongs(
					appState.user_id,
					start_index,
					page_length,
				);
			case "My Top Tracks":
				return await fetchTopTracks(appState.user_id, start_index, page_length);
			default:
				return await fetchMusicList(start_index, page_length);
		}
	};

	// Load initial songs
	useEffect(() => {
		const loadSongs = async () => {
			setIsLoading(true);
			try {
				const fetchedSongs = await fetchSongs(0, pageLength);
				setSongs(fetchedSongs);
				setStartIndex(pageLength);
				setHasMore(fetchedSongs.length === pageLength);
			} catch (error) {
				console.error("Error fetching songs:", error);
			} finally {
				setIsLoading(false);
			}
		};
		loadSongs();
	}, []);

	// Load more songs
	const loadMoreSongs = useCallback(async () => {
		if (isLoading || !hasMore) return;
		setIsLoading(true);
		try {
			const newSongs = await fetchSongs(startIndex, pageLength);
			setSongs((prev) => [...prev, ...newSongs]);
			setStartIndex((prev) => prev + newSongs.length);
			setHasMore(newSongs.length === pageLength);
		} catch (error) {
			console.error("Error loading more songs:", error);
		} finally {
			setIsLoading(false);
		}
	}, [startIndex, isLoading, hasMore]);

	// Scroll handler
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
			if (scrollHeight - scrollTop <= clientHeight + 80) {
				loadMoreSongs();
			}
		},
		[loadMoreSongs],
	);

	// Play a song
	const handleSongPlay = useCallback(
		(song: Song) => {
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

	// Add to queue
	const handleAddToQueue = useCallback(
		(song: Song) => enqueue(song),
		[enqueue],
	);

	// Add to liked songs
	const handleAddToLikedSongs = useCallback(
		async (song: Song) => {
			try {
				await toggleSongLiked(appState.user_id, song.id);
			} catch (error) {
				console.error("Error liking song:", error);
			}
		},
		[appState.user_id],
	);

	// Add to playlist
	const handleAddToPlaylist = useCallback(
		async (song: Song) => {
			try {
				const { playlists } = await fetchUserPlaylists(appState.user_id);
				if (playlists.length > 0) {
					await addSongToPlaylist({
						playlist_id: playlists[0].playlist_id,
						music_id: song.id,
						song_adder_id: appState.user_id,
					});
				}
			} catch (error) {
				console.error("Error adding to playlist:", error);
			}
		},
		[appState.user_id],
	);

	// Play all songs
	const playAllSongs = useCallback(() => {
		if (songs.length === 0) return;
		clearMusicState();
		clearQueue();
		handleSongPlay(songs[0]);
		songs.slice(1).forEach(enqueue);
	}, [songs, clearMusicState, clearQueue, handleSongPlay, enqueue]);

	return (
		<MusicListsProvider>
			<div className="flex  h-[80vh]">
				<div className="w-1/5 flex items-center justify-center">
					<PlayAllButton onPlayAll={playAllSongs} />
				</div>
				<div className="w-4/5 flex-1 overflow-auto no-scrollbar">
					<ScrollableSongList
						songs={songs}
						selectedSongId={selectedSongId}
						onScroll={handleScroll}
						onPlay={handleSongPlay}
						onAddToQueue={handleAddToQueue}
						onAddToLikedSongs={handleAddToLikedSongs}
						onAddToPlaylist={handleAddToPlaylist}
					/>
				</div>
			</div>
		</MusicListsProvider>
	);
};

export default AllSongsPage;
