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
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
		<ContextMenu>
			<ContextMenuTrigger className="music-container">
				<div className="music-photo-container" onClick={onClick}>
					<img className="music-photo" src={coverArt} alt={`${title} cover`} />
				</div>
				<div className="info-container">
					<div className="music-info">
						<h2 className="music-title">{title}</h2>
						<h3 className="artist-name opacity-75">{artist}</h3>
					</div>
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent className="bg-[#072631] bg-opacity-80 rounded-lg shadow-lg w-56">
				{/* Add to Queue */}
				<ContextMenuItem
					className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
					onSelect={handleAddToQueue}
				>
					<Plus className="mr-2 h-4 w-4" />
					<span>Add to Queue</span>
				</ContextMenuItem>

				{/* Add to Playlist Submenu */}
				<ContextMenuSub>
					<ContextMenuSubTrigger className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-white hover:text-black hover:rounded-lg">
						<PlusCircle className="mr-2 h-4 w-4" />
						<span>Add to Playlist</span>
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="bg-[#072631] bg-opacity-80 rounded-lg shadow-lg">
						{playlists.map((playlist) => (
							<ContextMenuItem
								key={playlist.playlist_id}
								className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
								onSelect={() => handleAddToPlaylist(playlist.playlist_id)}
							>
								{playlist.playlist_name}
							</ContextMenuItem>
						))}
					</ContextMenuSubContent>
				</ContextMenuSub>

				{/* Add to Liked Songs */}
				<ContextMenuItem
					className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
					onSelect={handleAddToLikedSongs}
				>
					<Heart className="mr-2 h-4 w-4" />
					<span>Add to Liked Songs</span>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};

export default Music;