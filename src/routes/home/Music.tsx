import React, { useState, useEffect } from "react";
import { EllipsisVertical } from "lucide-react";

// Local
import {
	fetchUserPlaylists,
	addSongToPlaylist,
	//types
	Playlist,
	FetchUserPlaylistsResponse,
} from "api/playlistApi";
import { toggleSongLiked } from "api/likedSongsApi";
import { useAppProvider } from "providers/AppProvider";
import { useQueueProvider } from "providers/QueueProvider";
import { useMusicLists } from "@/providers/MusicListContextProvider";


// Assets
import "./Music.css";
import { pathToFileURL } from "url";

interface MusicProps {
	musicId: string;
	title: string;
	artist: string;
	coverArt: string;
	onClick: () => void;
}

const Music: React.FC<MusicProps> = ({
	musicId,
	title,
	artist,
	coverArt,
	onClick,
}) => {
	const { appState } = useAppProvider();
	const { queue, enqueue } = useQueueProvider();
	const { notifyMusicPlayed } = useMusicLists();
	const currentUserId = appState.user_id;
	const userId = appState.user_id;
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [playlistListState, setPlaylistList] = useState<boolean>(false);
	const [playlists, setPlaylists] = useState<Playlist[]>([]);

	useEffect(() => {
		if (currentUserId) {
			fetchPlaylists();
		}
	}, [currentUserId]);

	const handleAddToQueue = () => {
		const track = {
			id: musicId,
			title: title,
			artist: artist,
			cover_img: coverArt,
		};

		enqueue(track);
	}; 
	const handleAddToPlaylist = async (playlistId: string): Promise<void> => {
		try {
			const response: FetchUserPlaylistsResponse =
				await fetchUserPlaylists(userId);
			console.log("playlists:", response.playlists);

			if (response.playlists.length === 0) {
				console.log("No playlists found for the user.");
				return;
			}

		
			console.log("playlistId:", playlistId);

			const songData = {
				playlist_id: playlistId,
				music_id: musicId,
			};

			const result = await addSongToPlaylist(songData);
			console.log("Song added to playlist successfully:", result);
		} catch (error) {
			console.error("Error adding song to playlist:", error);
		}
	};

	const handleAddToLikedSongs = async (): Promise<void> => {
		try {
			await toggleSongLiked(userId, musicId);
			notifyMusicPlayed(musicId, "Liked Songs"); // rerender the likedSongs
		} catch (error) {
			console.error("Error adding to liked songs:", error);
		}
	};

	const toggleDropdown = (): void => {
		setIsOpen(!isOpen);
	};

	const closeDropdown = (): void => {
		setIsOpen(false);
	};

	const togglePlaylistList = () => {
		setPlaylistList(!playlistListState)

	}
	const fetchPlaylists = async () => {
		try {
			const playlistsData: FetchUserPlaylistsResponse =
				await fetchUserPlaylists(currentUserId);
			setPlaylists(playlistsData.playlists);
		} catch (error) {
			console.error("Error fetching playlists:", error);
		}
	};

	return (
		<div className="music-container">
			<div className="music-photo-container" onClick={onClick}>
				<img className="music-photo" src={coverArt} alt={`${title} cover`} />
			</div>
			<div className="info-container">
				<div className="music-info">
					<h2 className="music-title">{title}</h2>
					<h3 className="artist-name opacity-75">{artist}</h3>
				</div>
			</div>
			<div
				className="dropdown absolute right-0 bottom-3"
			>
				<EllipsisVertical className="opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={toggleDropdown}/>
				{isOpen && (
					<div className="dropdown-items fixed">
						<div
							className="dropdown-item"
							onClick={() => {
								closeDropdown();
								handleAddToQueue();
							}}
						>
							Add to Queue
						</div>
						<div
							className="dropdown-item p-2"
							
							onClick={() => {
								togglePlaylistList();
							}}
						>
							Add to Playlist
						</div>
						{
							playlistListState && (
								<>
									<div className="fixed left-[190px] top-32 h-[50%] overflow-scroll no-scrollbar bg-[#072631] rounded-sm opacity-80">
										{playlists.map((playlist) => (

											<div
												className="p-2   bg-[#072631] hover:bg-[#157697]"
												onClick={() => {
													handleAddToPlaylist(playlist.playlist_id);
													closeDropdown();
													togglePlaylistList();
												}}
											>
												{playlist.playlist_name}
											</div>

										))}</div></>

							)
						}
						<div
							className="dropdown-item"
							onClick={() => {
								closeDropdown();
								handleAddToLikedSongs();
							}}
						>
							Add to Liked Songs
						</div>
					</div>
				)}
			</div>

		</div>
	);

};

export default Music;
