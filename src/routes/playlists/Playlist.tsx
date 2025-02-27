import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import SongContainer from "@/routes/playlists/SongContainer";
import User2 from "/user_images/sameep.jpg";
import { Dot, Edit, Play, Trash2 } from "lucide-react";
import { useAppProvider } from "providers/AppProvider";
import { getUserData, fetchUserProfilePicture } from "@/api/user/userApi";
import { useQueueProvider } from "providers/QueueProvider";
import { useMusicProvider } from "providers/MusicProvider";
import { useNavigate } from "react-router-dom";
import {
	fetchPlaylistById,
	PlaylistResponse,
	updatePlaylistCoverImg,
	fetchPlaylistCoverImg,
	deletePlaylist,
} from "../../api/playlist/playlistApi";

// Component for playlist cover image and edit functionality
interface PlaylistCoverProps {
	coverUrl: string;
	timestamp: number;
	onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}
const PlaylistCover: React.FC<PlaylistCoverProps> = ({
	coverUrl,
	timestamp,
	onImageChange,
}) => (
	<div className="playlistcover relative self-center rounded-[10px] h-[50%] w-[28.125] overflow-hidden">
		<img
			src={`${coverUrl}?t=${timestamp}`}
			className="w-full h-full object-cover"
			alt="Playlist Cover"
		/>
		<label
			htmlFor="edit-cover"
			className="absolute top-2 right-2 cursor-pointer"
		>
			<Edit className="h-4 w-4 text-white bg-black rounded-full p-1" />
		</label>
		<input
			id="edit-cover"
			type="file"
			accept="image/*"
			className="hidden"
			onChange={onImageChange}
		/>
	</div>
);

// Component for playlist basic information
interface PlaylistInfoProps {
	playlistData: PlaylistResponse | null;
}
const PlaylistInfo: React.FC<PlaylistInfoProps> = ({ playlistData }) => (
	<div className="playlistinfo self-center">
		<div className="playlistname text-white text-[50px] font-bold text-nowrap w-50">
			{playlistData?.playlist?.playlist_name || "Untitled Playlist"}
		</div>
		<div className="typeofplaylist text-white text-[15px] relative text-lg pl-1 top-[-9px] font-thin">
			{playlistData?.playlist?.is_playlist_combined
				? "Combined Playlist"
				: "Solo Playlist"}
		</div>
	</div>
);

// Component for creator information
interface CreatorsInfoProps {
	username: string;
	user1Pfp: string;
	songCount: number | undefined;
}
const CreatorsInfo: React.FC<CreatorsInfoProps> = ({
	username,
	user1Pfp,
	songCount,
}) => (
	<div className="infobar flex relative top-[-9px]">
		<div className="playlistcreators flex gap-2">
			<div className="self-center p-1">
				<img
					className="absolute h-[20px] w-[20px] rounded-full"
					src={user1Pfp}
					alt="Creator 1"
				/>
				<img
					className="relative left-2 h-[20px] w-[20px] rounded-full"
					src={User2}
					alt="Creator 2"
				/>
			</div>
			<div className="creatorname text-white opacity-50 pb-0.5 text-[10px] font-semibold self-center">
				{username || "Unknown User"} and 1 other
			</div>
		</div>
		<div className="text-white opacity-50 text-[7px] font-bold self-center">
			<Dot className="p-0 h-5 w-5" />
		</div>
		<div className="songcount text-white opacity-50 text-[8px] font-bold self-center pb-0.5">
			{songCount || 0} songs
		</div>
	</div>
);

// Component for control buttons
interface ControlButtonsProps {
	onPlayClick: () => void;
	onDeleteClick: () => Promise<void>;
}
const ControlButtons: React.FC<ControlButtonsProps> = ({
	onPlayClick,
	onDeleteClick,
}) => (
	<div className="controlbuttons flex gap-4">
		<div className="playbutton cursor-pointer size-2" onClick={onPlayClick}>
			<Play className="bg-[black] text-slate-300 rounded-full p-2 text-lg hover:bg-opacity-80" />
		</div>
		<div className="deletebutton cursor-pointer size-2" onClick={onDeleteClick}>
			<Trash2 className="bg-[black] text-slate-300 rounded-full p-2 text-lg hover:bg-opacity-80" />
		</div>
	</div>
);

//Main Playlist Page Component
const Playlist: React.FC = () => {
	const { appState } = useAppProvider();
	const currentUserId: string = appState.user_id;
	const { playlistId } = useParams<{ playlistId: string }>();
	const [playlistData, setPlaylistData] = useState<PlaylistResponse | null>(
		null,
	);
	const [playlistCover, setPlaylistCover] = useState<string>(
		"/playlistimages/playlistimage.png",
	);
	const [timestamp, setTimestamp] = useState<number>(Date.now());
	const [username, setUsername] = useState<string>("");
	const [user1Pfp, setUser1Pfp] = useState<string>("/sadit.jpg");
	const { updateQueue } = useQueueProvider();
	const { clearMusicState } = useMusicProvider();
	const navigate = useNavigate();

	useEffect(() => {
		const loadPlaylistData = async () => {
			try {
				if (playlistId) {
					const data: PlaylistResponse = await fetchPlaylistById(playlistId);
					setPlaylistData(data);
					const coverImageUrl: string = await fetchPlaylistCoverImg(playlistId);
					setPlaylistCover(coverImageUrl);
				}
			} catch (error) {
				console.error("Error:", error);
			}
		};
		loadPlaylistData();
	}, [playlistId]);

	useEffect(() => {
		const fetchUser = async () => {
			if (currentUserId) {
				try {
					const userData = await getUserData(currentUserId);
					setUsername(userData.username);
					const pfpUrl: string = await fetchUserProfilePicture(currentUserId);
					setUser1Pfp(pfpUrl);
				} catch (error) {
					console.error("Error fetching user data:", error);
				}
			}
		};
		fetchUser();
	}, [currentUserId]);

	const playAllSongs = (): void => {
		clearMusicState();
		if (playlistData) {
			const newQueue = playlistData.songs.map((item) => ({
				id: item.music_id,
				...item,
				image_url: item.image_url,
			}));
			updateQueue(newQueue);
		}
	};

	const handleDeletePlaylist = async (): Promise<void> => {
		if (!playlistId) return;
		try {
			await deletePlaylist(playlistId);
			navigate("/playlists");
			alert("Playlist deleted successfully");
		} catch (error) {
			alert("Failed to delete playlist" + error);
		}
	};

	const handleImageChange = async (
		event: ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		const file = event.target.files?.[0];
		if (!file || !playlistId) return;

		try {
			const tempImageUrl: string = URL.createObjectURL(file);
			setPlaylistCover(tempImageUrl);
			await updatePlaylistCoverImg(playlistId, tempImageUrl);
			setTimestamp(Date.now());
			const newImageUrl: string = `${await fetchPlaylistCoverImg(playlistId)}?t=${Date.now()}`;
			setPlaylistCover(newImageUrl);
			URL.revokeObjectURL(tempImageUrl);
		} catch (error) {
			console.error("Error updating playlist cover image:", error);
			setPlaylistCover("/playlistimages/playlistimage.png");
		}
	};

	return (
		<>
			<div className="flex  top-[20%] left-[10%]  h-[50%] w-[50%]">
				<div className="flex flex-col flex-1">
					<PlaylistCover
						coverUrl={playlistCover}
						timestamp={timestamp}
						onImageChange={handleImageChange}
					/>
					<PlaylistInfo playlistData={playlistData} />
					<CreatorsInfo
						username={username}
						user1Pfp={user1Pfp}
						songCount={playlistData?.songs?.length}
					/>
					<ControlButtons
						onPlayClick={playAllSongs}
						onDeleteClick={handleDeletePlaylist}
					/>
				</div>
				<div className="flex flex-col flex-1">
					<SongContainer
						playlistId={playlistId || ""}
						songs={playlistData?.songs || []}
					/>
				</div>
			</div>
		</>
	);
};

export default Playlist;
