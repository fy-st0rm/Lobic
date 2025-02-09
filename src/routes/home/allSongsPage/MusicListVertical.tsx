import React, { useState, useEffect, useCallback } from "react";
import { Play } from "lucide-react";
import { MusicTrack as Song, MPState } from "@/api/music/musicApi";
import { useAppProvider } from "providers/AppProvider";
import { useQueueProvider } from "providers/QueueProvider";
import { useMusicProvider, MusicState } from "providers/MusicProvider";
import { toggleSongLiked } from "@/api/music/likedSongsApi";
import {
	addSongToPlaylist,
	fetchUserPlaylists,
} from "@/api/playlist/playlistApi";
import SongItem from "./SongItem";
import { useSidebarState } from "@/components/SideBar/SideBar";

// Main MusicListVertical Component
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
	const { enqueue, clearQueue } = useQueueProvider();
	const { clearMusicState, updateMusicState } = useMusicProvider();

	// Fetch initial songs on mount
	const loadInitialSongs = async () => {
		setIsLoading(true);
		try {
			const fetchedSongs = await fetchSongs(0, pageLength);
			const songsWithCoverImages = await Promise.all(
				fetchedSongs.map(async (song) => {
					return song;
				}),
			);
			setSongs(songsWithCoverImages);
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

	// Infinite scroll with debounce
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
			const scrollThreshold = 80; // Load more when within 200px of bottom

			if (scrollHeight - scrollTop <= clientHeight + scrollThreshold) {
				loadMoreSongs();
			}
		},
		[loadMoreSongs],
	);

	const handleSongPlay = async (song: Song) => {
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
	};

	const handleAddToQueue = (song: Song) => {
		enqueue(song);
	};

	const handleAddToLikedSongs = async (song: Song) => {
		try {
			await toggleSongLiked(appState.user_id, song.id);
		} catch (error) {
			console.error("Error adding to liked songs:", error);
		}
	};

	const handleAddToPlaylist = async (song: Song) => {
		try {
			const response = await fetchUserPlaylists(appState.user_id);
			if (response.playlists.length === 0) return;

			await addSongToPlaylist({
				playlist_id: response.playlists[0].playlist_id,
				music_id: song.id,
			});
		} catch (error) {
			console.error("Error adding song to playlist:", error);
		}
	};

	const playAllSongs = () => {
		if (songs.length === 0) return;
		clearMusicState();
		clearQueue();
		handleSongPlay(songs[0]);
		songs.slice(1).forEach((song) => enqueue(song));
	};
	const { isExtended } = useSidebarState();
	return (
		<div
			className={`flex flex-col h-[80vh] relative top-[115px] transition-all ${
				isExtended ? "w-[86vw] left-[13vw]" : "w-[93vw] left-[6vw]"
			}`}
		>
			<div className="fixed top-[115px] w-full bg-white z-10">
				<button
					onClick={playAllSongs}
					className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
				>
					<Play className="h-5 w-5" />
					Play All
				</button>
			</div>

			<div
				className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-muted scrollbar-thumb-primary mt-[60px]"
				onScroll={handleScroll}
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

export default MusicListVertical;
