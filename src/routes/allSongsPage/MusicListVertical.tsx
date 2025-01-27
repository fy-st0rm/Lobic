import React, { useState, useEffect } from "react";
import { EllipsisVertical, Heart, Play, Plus } from "lucide-react";
import {
	MusicTrack as Song,
	getMusicImageUrl,
	MPState,
} from "@/api/music/musicApi";
import {
	fetchUserPlaylists,
	addSongToPlaylist,
	Playlist,
	FetchUserPlaylistsResponse,
} from "@/api/playlist/playlistApi";
import { toggleSongLiked } from "@/api/music/likedSongsApi";
import { useAppProvider } from "providers/AppProvider";
import { useQueueProvider } from "providers/QueueProvider";
import { useMusicProvider, MusicState } from "providers/MusicProvider";
import { useMusicLists } from "@/providers/MusicListContextProvider";

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
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
	const pageLength = 20;

	const { appState } = useAppProvider();
	const { enqueue, clearQueue } = useQueueProvider();
	const { clearMusicState, updateMusicState } = useMusicProvider();
	const { notifyMusicPlayed } = useMusicLists();
	const userId = appState.user_id;

	// Fetch initial songs on mount
	useEffect(() => {
		const loadInitialSongs = async () => {
			setIsLoading(true);
			try {
				const fetchedSongs = await fetchSongs(0, pageLength);

				const songsWithCoverImages = await Promise.all(
					fetchedSongs.map(async (song) => {
						const coverImageUrl = await getMusicImageUrl(song.id);
						return {
							...song,
							cover_img: coverImageUrl,
						};
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

		loadInitialSongs();
	}, [fetchSongs]);

	// Infinite scroll handler for container
	const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

		if (
			!isLoading &&
			hasMore &&
			scrollHeight - scrollTop <= clientHeight + 100
		) {
			setIsLoading(true);
			try {
				const newSongs = await fetchSongs(startIndex, pageLength);

				if (newSongs.length > 0) {
					const newSongsWithCovers = await Promise.all(
						newSongs.map(async (song) => {
							const coverImageUrl = await getMusicImageUrl(song.id);
							return {
								...song,
								cover_img: coverImageUrl,
							};
						}),
					);

					setSongs((prev) => [...prev, ...newSongsWithCovers]);
					setStartIndex((prev) => prev + pageLength);
					setHasMore(newSongs.length === pageLength);
				} else {
					setHasMore(false);
				}
			} catch (error) {
				console.error("Error fetching more songs:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	// Play a single song
	const handleSongPlay = async (song: Song) => {
		try {
			setSelectedSongId(song.id);
			setIsLoading(true);
			const coverArt = getMusicImageUrl(song.id);
			clearMusicState();
			clearQueue();
			updateMusicState({
				id: song.id,
				title: song.title,
				artist: song.artist,
				cover_img: coverArt,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
		} catch (error) {
			console.error("Error playing song:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Add to queue
	const handleAddToQueue = (song: Song) => {
		const track = {
			id: song.id,
			title: song.title,
			artist: song.artist,
			album: song.album,
			cover_img: song.cover_img,
		};
		enqueue(track);
	};

	// Add to playlist
	const handleAddToPlaylist = async (song: Song): Promise<void> => {
		try {
			const response: FetchUserPlaylistsResponse =
				await fetchUserPlaylists(userId);

			if (response.playlists.length === 0) {
				console.log("No playlists found for the user.");
				return;
			}

			const playlistId = response.playlists[0].playlist_id;
			const songData = {
				playlist_id: playlistId,
				music_id: song.id,
			};

			const result = await addSongToPlaylist(songData);
		} catch (error) {
			console.error("Error adding song to playlist:", error);
		}
	};

	// Toggle liked songs
	const handleAddToLikedSongs = async (song: Song): Promise<void> => {
		try {
			await toggleSongLiked(userId, song.id);
		} catch (error) {
			console.error("Error adding to liked songs:", error);
		}
	};

	// Play all songs functionality
	const playAllSongs = () => {
		clearMusicState();
		clearQueue();

		let firstSong = songs[0];

		if (firstSong) {
			const coverArt = getMusicImageUrl(firstSong.id);
			updateMusicState({
				id: firstSong.id,
				title: firstSong.title,
				artist: firstSong.artist,
				cover_img: coverArt,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
		}

		songs.slice(1).forEach((item) => {
			const coverArt = getMusicImageUrl(item.id);
			let track = {
				...item,
				cover_img: coverArt,
			};
			enqueue(track);
		});
	};

	// Toggle dropdown
	const toggleDropdown = (songId: string) => {
		setOpenDropdownId(openDropdownId === songId ? null : songId);
	};

	return (
		<div className="fixed right-[10%] top-[10%] w-[80%] h-[80%] bg-gray-900 rounded-l-2xl shadow-lg overflow-hidden flex flex-col">
			{/* Header with Play All Button */}
			<div className="sticky top-0 z-10 bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
				<h2 className="flex items-center font-bold px-4 pb-3 text-xl text-white">
					Playlist
				</h2>
				<button
					onClick={playAllSongs}
					className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
				>
					<Play className="h-5 w-5" />
					Play All
				</button>
			</div>

			{/* Music List Scroll Area */}
			<div
				className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-green-600"
				onScroll={handleScroll}
			>
				{songs.map((song) => (
					<div
						key={song.id}
						className={`flex items-center p-4 transition-colors group ${
							selectedSongId === song.id
								? "bg-green-800"
								: "bg-gray-900 hover:bg-gray-800"
						}`}
					>
						{/* Song Cover Image */}
						<img
							src={song.cover_img}
							alt={song.title}
							className="w-16 h-16 rounded-lg object-cover cursor-pointer"
							onClick={() => handleSongPlay(song)}
						/>

						{/* Song Details */}
						<div className="ml-4 flex-1">
							<h3 className="text-lg font-semibold text-white truncate">
								{song.title}
							</h3>
							<p className="text-sm text-gray-400 truncate">{song.artist}</p>
						</div>

						{/* More Actions */}
						<div className="relative">
							<div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<button
									onClick={() => handleAddToQueue(song)}
									className="hover:bg-gray-700 rounded-full p-2"
								>
									<Plus className="h-5 w-5 text-white opacity-70 hover:opacity-100" />
								</button>
								<button
									onClick={() => handleAddToLikedSongs(song)}
									className="hover:bg-gray-700 rounded-full p-2"
								>
									<Heart className="h-5 w-5 text-white opacity-70 hover:opacity-100" />
								</button>
								<button
									onClick={() => toggleDropdown(song.id)}
									className="hover:bg-gray-700 rounded-full p-2"
								>
									<EllipsisVertical className="h-5 w-5 text-white opacity-70 hover:opacity-100" />
								</button>
							</div>

							{openDropdownId === song.id && (
								<div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-50">
									<div
										className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center"
										onClick={() => {
											handleAddToQueue(song);
											toggleDropdown(song.id);
										}}
									>
										<Plus className="h-4 w-4 mr-2" /> Add to Queue
									</div>
									<div
										className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center"
										onClick={() => {
											handleAddToPlaylist(song);
											toggleDropdown(song.id);
										}}
									>
										<Plus className="h-4 w-4 mr-2" /> Add to Playlist
									</div>
									<div
										className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center"
										onClick={() => {
											handleAddToLikedSongs(song);
											toggleDropdown(song.id);
										}}
									>
										<Heart className="h-4 w-4 mr-2" /> Add to Liked Songs
									</div>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default MusicListVertical;
