import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import SongContainer from "@/routes/playlists/SongContainer";
import { Dot, Edit } from "lucide-react";
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

import Pencil from "/profile/pencil.svg";
import Play from "/playlistcontrols/Pause.svg";
import Trash from "/playlistcontrols/Trash.svg";
import UploadModal from "@/components/UploadModal";

// Component for playlist cover image and edit functionality
interface PlaylistCoverProps {
	coverUrl: string;
	timestamp: number;
	onEditClick: () => void;
}
const PlaylistCover: React.FC<PlaylistCoverProps> = ({
	coverUrl,
	timestamp,
	onEditClick,
}) => (
	<div className="h-60 w-60 relative">
		<img
			src={`${coverUrl}?t=${timestamp}`}
			className="w-full h-full rounded-md object-cover"
			alt="Playlist Cover"
		/>
		<button
			className="absolute bottom-2 right-2 bg-primary p-2 rounded-full hover:bg-darker h-10 w-10 flex items-center justify-center cursor-pointer"
			onClick={onEditClick}
		>
			<img src={Pencil} alt="Edit Cover" />
		</button>
	</div>
);

// Component for playlist basic information
interface PlaylistInfoProps {
	playlistData: PlaylistResponse | null;
}
const PlaylistInfo: React.FC<PlaylistInfoProps> = ({ playlistData }) => (
	<div className="playlistinfo text-primary_fg">
		<div className="">
			{playlistData?.playlist?.is_playlist_combined
				? "Combined Playlist"
				: "Solo Playlist"}
		</div>
		<div className="font-DM_Sans text-7xl font-bold py-2">
			{playlistData?.playlist?.playlist_name || "Untitled Playlist"}
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
		<div className="playlistcreators flex gap-1">
			<div className="">
				<img
					className="h-7 w-7 rounded-full m-1"
					src={user1Pfp}
					alt="Creator 1"
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

// Component for control buttons
interface ControlButtonsProps {
	onPlayClick: () => void;
	onDeleteClick: () => Promise<void>;
}
const ControlButtons: React.FC<ControlButtonsProps> = ({
	onPlayClick,
	onDeleteClick,
}) => (
	<div className="flex gap-2 mx-10 px-1">
		<div className="playbutton cursor-pointer " onClick={onPlayClick}>
			<img className="h-16 w-16 transition-all hover:scale-110" src={Play} />
		</div>
		<div
			className="deletebutton cursor-pointer self-center "
			onClick={onDeleteClick}
		>
			<img
				className="h-8 w-8 transition-all opacity-80 hover:opacity-100"
				src={Trash}
			/>
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

	//states for updating the cover_image
	const [showModal, setShowModal] = useState<boolean>(false); // Modal state
	const [selectedImage, setSelectedImage] = useState<File | null>(null); // Selected image
	const [isUpdating, setIsUpdating] = useState<boolean>(false); // Upload status

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

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) setSelectedImage(file);
	};
	const handleUpload = async () => {
		if (!selectedImage || !playlistId) {
			alert("Please select an image first.");
			return;
		}

		try {
			setIsUpdating(true);
			const tempImageUrl: string = URL.createObjectURL(selectedImage);
			setPlaylistCover(tempImageUrl); // Preview immediately
			await updatePlaylistCoverImg(playlistId, tempImageUrl);
			const newImageUrl: string = `${await fetchPlaylistCoverImg(playlistId)}?t=${Date.now()}`;
			setPlaylistCover(newImageUrl);
			setTimestamp(Date.now());
			URL.revokeObjectURL(tempImageUrl);
			setShowModal(false);
		} catch (error) {
			console.error("Error updating playlist cover image:", error);
			setPlaylistCover("/playlistimages/playlistimage.png");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<>
			<div className=" flex gap-5 mt-10 mx-10 mb-5 items-end">
				<PlaylistCover
					coverUrl={playlistCover}
					timestamp={timestamp}
					onEditClick={() => setShowModal(true)}
				/>
				<div>
					<PlaylistInfo playlistData={playlistData} />
					<CreatorsInfo
						username={username}
						user1Pfp={user1Pfp}
						songCount={playlistData?.songs?.length}
					/>
				</div>
			</div>
			<div>
				<ControlButtons
					onPlayClick={playAllSongs}
					onDeleteClick={handleDeletePlaylist}
				/>
			</div>
			<div className="ml-5 my-5">
				<SongContainer
					playlistId={playlistId || ""}
					songs={playlistData?.songs || []}
				/>
			</div>

			<UploadModal
				showModal={showModal}
				onClose={() => setShowModal(false)}
				onFileChange={handleFileChange}
				onUpload={handleUpload}
				isUpdating={isUpdating}
				title="Upload Playlist Cover" // Custom title for playlist
			/>
		</>
	);
};

export default Playlist;
