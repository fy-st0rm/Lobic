import { Plus, PlusCircle, Heart, CircleArrowOutUpRight } from "lucide-react";
import { addSongToPlaylist } from "api/playlist/playlistApi";
import { toggleSongLiked } from "api/music/likedSongsApi";
import { useAppProvider } from "providers/AppProvider";
import { useQueueProvider } from "providers/QueueProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useMusicLists } from "providers/MusicListContextProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { MPState } from "api/music/musicApi";
import { OpCode, wsSend } from "api/socketApi";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { ImageFromUrl } from "@/api/music/musicApi";

interface MusicProps {
	musicId: string;
	title: string;
	artist: string;
	album: string;
	image_url: string;
	onClick: () => void;
}

const Music: React.FC<MusicProps> = ({
	musicId,
	title,
	artist,
	album,
	image_url,
	onClick,
}) => {
	const { appState } = useAppProvider();
	const { enqueue } = useQueueProvider();
	const { lobbyState } = useLobbyProvider();
	const { notifyMusicPlayed, playlists, refreshPlaylists } = useMusicLists();
	const { getSocket } = useSocketProvider();
	const userId = appState.user_id;

	const handleAddToQueue = () => {
		const track = {
			id: musicId,
			title,
			artist,
			album,
			image_url,
		};
		enqueue(track);
	};

	const handleAddToPlaylist = async (playlistId: string): Promise<void> => {
		try {
			const songData = {
				playlist_id: playlistId,
				music_id: musicId,
				//song addeer id
				song_adder_id: userId,
			};
			await addSongToPlaylist(songData);
			await refreshPlaylists(); // Refresh playlists after adding song
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

	const handleRequestMusic = () => {
		const music = {
			id: musicId,
			title: title,
			artist: artist,
			image_url: image_url,
			timestamp: 0,
			state: MPState.PAUSE,
		};

		const payload = {
			op_code: OpCode.REQUEST_MUSIC_PLAY,
			value: {
				lobby_id: lobbyState.lobby_id,
				music: music,
			},
		};

		wsSend(getSocket(), payload);
	};

	//this definatly needs rework
	return (
		<ContextMenu>
			<ContextMenuTrigger className="flex flex-col p-3 m-1 rounded-md transition-all  hover:bg-secondary hover:bg-opacity-80 overflow-hidden">
				<div className="h-45 w-45 flex-shrink-0" onClick={onClick}>
					<img
						className="rounded-lg shadow-lg h-44 w-44 object-cover"
						src={ImageFromUrl(image_url)}
						alt={`${title} cover`}
					/>
				</div>
				<div className="flex-col justify-start items-start w-44">
					<div
						className={`text-sm font-semibold m-0 justify-self-start pt-1 px-1 text-primary_fg truncate ${title.length > 24 ? "w-44" : ""}`}
					>
						{title}
					</div>
					<div className="text-sm opacity-75 m-0 px-1 justify-self-start text-primary_fg truncate">
						{artist}
					</div>
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent className="bg-[#072631] bg-opacity-80 rounded-lg shadow-lg w-56">
				<ContextMenuItem
					className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
					onSelect={handleAddToQueue}
				>
					<Plus className="mr-2 h-4 w-4" />
					<span>Add to Queue</span>
				</ContextMenuItem>

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

				<ContextMenuItem
					className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
					onSelect={handleAddToLikedSongs}
				>
					<Heart className="mr-2 h-4 w-4" />
					<span>Add to Liked Songs</span>
				</ContextMenuItem>

				{
					/* Show request music option only if the client is in lobby and not a host */
					lobbyState.in_lobby && !lobbyState.is_host && (
						<ContextMenuItem
							className="flex items-center px-3 py-2 text-sm font-bold text-white hover:bg-[#157697] hover:bg-opacity-50 hover:rounded-lg"
							onSelect={handleRequestMusic}
						>
							<CircleArrowOutUpRight className="mr-2 h-4 w-4" />
							<span>Request Music</span>
						</ContextMenuItem>
					)
				}
			</ContextMenuContent>
		</ContextMenu>
	);
};

export default Music;
