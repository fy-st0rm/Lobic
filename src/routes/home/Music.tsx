import React, { useState, useEffect } from "react";
import { EllipsisVertical, Plus, PlusCircle, Heart } from "lucide-react";

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

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Assets
import "./Music.css";

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

			if (response.playlists.length === 0) {
				console.log("No playlists found for the user.");
				return;
			}

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
			notifyMusicPlayed(musicId, "Liked Songs");
		} catch (error) {
			console.error("Error adding to liked songs:", error);
		}
	};

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
			<DropdownMenu>
				{/* Dropdown Trigger */}
				<DropdownMenuTrigger className="dropdown absolute right-0 bottom-3 bg-transparent p-2">
					<EllipsisVertical className="text-white opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer" />
				</DropdownMenuTrigger>

				{/* Dropdown Content */}
				<DropdownMenuContent className="bg-[#072631] bg-opacity-80 rounded-lg shadow-lg w-56">
					{/* Add to Queue */}
					<DropdownMenuItem
						className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
						onSelect={handleAddToQueue}
					>
						<Plus className="mr-2 h-4 w-4" />
						<span>Add to Queue</span>
					</DropdownMenuItem>

					{/* Add to Playlist Submenu */}
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-white hover:text-black hover:rounded-lg">
							<PlusCircle className="mr-2 h-4 w-4" />
							<span>Add to Playlist</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="bg-[#072631] bg-opacity-80 rounded-lg shadow-lg">
							{playlists.map((playlist) => (
								<DropdownMenuItem
									key={playlist.playlist_id}
									className="flex items-center px-3 py-2 text-sm font-bold text-white  hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
									onSelect={() => handleAddToPlaylist(playlist.playlist_id)}
								>
									{playlist.playlist_name}
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					{/* Add to Liked Songs */}
					<DropdownMenuItem
						className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
						onSelect={handleAddToLikedSongs}
					>
						<Heart className="mr-2 h-4 w-4" />
						<span>Add to Liked Songs</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default Music;
