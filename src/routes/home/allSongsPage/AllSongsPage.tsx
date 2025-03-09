import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Dot, Clock } from "lucide-react";
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
import { getUserData, fetchUserProfilePicture } from "@/api/user/userApi";
import Play from "/playlistcontrols/Pause.svg";

// Cover Image Component
interface CoverImageProps {
	imageUrl: string;
}

const CoverImage: React.FC<CoverImageProps> = ({ imageUrl }) => (
	<div className="h-60 w-60">
		<img
			src={imageUrl}
			className="w-full h-full rounded-md"
			alt="Music List Cover"
		/>
	</div>
);

// Music List Info Component
interface MusicListInfoProps {
	title: string;
}

const MusicListInfo: React.FC<MusicListInfoProps> = ({ title }) => (
	<div className="playlistinfo text-primary_fg">
		<div className="">
			Music Collection
		</div>
		<div className="font-DM_Sans text-7xl font-bold py-2">
			{title || "Featured Music"}
		</div>
	</div>
);

// User Info Component
interface UserInfoProps {
	username: string;
	userPfp: string;
	songCount: number;
}

const UserInfo: React.FC<UserInfoProps> = ({
	username,
	userPfp,
	songCount,
}) => (
	<div className="infobar flex relative top-[-9px]">
		<div className="playlistcreators flex gap-1">
			<div className="">
				<img
					className="h-7 w-7 rounded-full m-1"
					src={userPfp}
					alt="User Profile"
				/>
			</div>
			<div className="creatorname text-primary_fg pb-0.5 text-sm font-semibold self-center">
				{username || "Unknown User"}
			</div>
		</div>
		<div className="text-white opacity-50 text-[7px] font-bold self-center">
			<Dot className="p-0 h-5 w-5" />
		</div>
		<div className="songcount text-white opacity-50 text-sm font-bold self-center pb-0.5">
			{songCount || 0} songs
		</div>
	</div>
);

// Control Buttons Component
interface ControlButtonsProps {
	onPlayClick: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
	onPlayClick,
}) => (
	<div className="flex gap-2 mx-10 px-1">
		<div className="playbutton cursor-pointer" onClick={onPlayClick}>
			<img className="h-16 w-16 transition-all hover:scale-110" src={Play} alt="Play Button" />
		</div>
	</div>
);

// Song List Header Component
const SongListHeader: React.FC = () => (
	<div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-700 text-gray-400 text-sm font-medium">
		<div className="col-span-1 text-center">#</div>
		<div className="col-span-5">TITLE</div>
		<div className="col-span-4">ALBUM</div>
		<div className="col-span-2 flex justify-end items-center">
			<Clock className="h-4 w-4" />
		</div>
	</div>
);

// Main AllSongsPage Component with Playlist UI
const AllSongsPage: React.FC = () => {
	const [songs, setSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [startIndex, setStartIndex] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
	const [username, setUsername] = useState<string>("");
	const [userPfp, setUserPfp] = useState<string>("/sadit.jpg");
	const pageLength = 20;

	const location = useLocation();
	const listTitle = location.state?.listTitle || "Featured Music";
	const coverImage = location.state?.coverImage || "/playlistimages/playlistimage.png";
	
	const { appState } = useAppProvider();
	const { enqueue, clearQueue, updateQueue } = useQueueProvider();
	const { clearMusicState, updateMusicState, controlsDisabled } = useMusicProvider();

	// Fetch songs based on list type
	const fetchSongs = async (start_index: number, page_length: number) => {
		switch (listTitle) {
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
	}, [listTitle]);

	// Fetch user data
	useEffect(() => {
		const fetchUser = async () => {
			if (appState.user_id) {
				try {
					const userData = await getUserData(appState.user_id);
					setUsername(userData.username);
					const pfpUrl: string = await fetchUserProfilePicture(appState.user_id);
					setUserPfp(pfpUrl);
				} catch (error) {
					console.error("Error fetching user data:", error);
				}
			}
		};
		fetchUser();
	}, [appState.user_id]);

	// Load more songs on scroll
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
	}, [startIndex, isLoading, hasMore, listTitle]);

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
			if (controlsDisabled) return;

			setSelectedSongId(song.id);
			clearMusicState();
			clearQueue();
			updateMusicState({
				id: song.id,
				title: song.title,
				artist: song.artist,
				image_url: song.image_url,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
		},
		[clearMusicState, clearQueue, updateMusicState],
	);

	// Add to queue
	const handleAddToQueue = useCallback(
		(song: Song) => {
			if (controlsDisabled) return;
			enqueue(song);
		},
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
		if (controlsDisabled) return;

		clearQueue();
		if (songs.length === 0) return;
		clearMusicState();
		const newQueue = songs.map(song => ({
			...song,
			image_url: song.image_url,
		}));
		updateQueue(newQueue);
		
	}, [songs, clearMusicState, updateQueue,clearQueue]);

	return (
		<MusicListsProvider>
			<div className="">
				<div className="flex gap-5 mt-10 mx-10 mb-5 items-end">
					<CoverImage imageUrl={coverImage} />
					<div>
						<MusicListInfo title={listTitle} />
						<UserInfo
							username={username}
							userPfp={userPfp}
							songCount={songs.length}
						/>
					</div>
				</div>
				
				<div>
					<ControlButtons onPlayClick={playAllSongs} />
				</div>
				
				<div className="mx-2 mt-2">
					{/* Column Headers */}
					<SongListHeader />
					
					{/* Song List */}
					<div className=" h-[43vh] overflow-auto no-scrollbar" onScroll={handleScroll}>
						{songs.map((song, index) => (
							<div
								key={song.id}
								onClick={() => !isLoading && handleSongPlay(song)}
								className={`cursor-pointer hover:bg-primary-100 transition-colors rounded-sm ${
									selectedSongId === song.id ? "bg-primary-200" : ""
								} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								<SongItem
									index={index}
									song={song}
									onAddToQueue={handleAddToQueue}
									onAddToLikedSongs={handleAddToLikedSongs}
									onAddToPlaylist={handleAddToPlaylist}
								/>
							</div>
						))}
						
						{isLoading && <div className="text-center py-4">Loading more songs...</div>}
					</div>
				</div>
			</div>
		</MusicListsProvider>
	);
};

export default AllSongsPage;
