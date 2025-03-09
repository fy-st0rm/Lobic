import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import SongContainer from "@/routes/playlists/SongContainer";
import { Dot } from "lucide-react";
import { useAppProvider } from "providers/AppProvider";
import { getUserData, fetchUserProfilePicture, User } from "@/api/user/userApi";
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
import Add from "/contributor/person-add-svgrepo-com.svg";
import UploadModal from "@/components/UploadModal";
import { fetchFriends, Friend } from "@/api/friendApi";
import { AddContibutorFriendList } from "./friendList";

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
	user_uuid: string;
	songCount: number | undefined;
}
const CreatorsInfo: React.FC<CreatorsInfoProps> = ({
	username,
	user_uuid,
	songCount,
}) => {
	const [profilePicture, setProfilePicture] = useState<string>("/sadit.jpg");
	useEffect(() => {
		const fetchProfilePicture = async () => {
			try {
				const imageUrl: string = await fetchUserProfilePicture(user_uuid);
				setProfilePicture(imageUrl);
			} catch (error) {
				console.error("Failed to fetch profile picture:", error);
				setProfilePicture("/sadit.jpg");
			}
		};
		fetchProfilePicture();
	}, [user_uuid]);
	return (
		<div className="infobar flex relative top-[-9px]">
			<div className="playlistcreators flex gap-1">
				<div className="">
					<img
						className="h-7 w-7 rounded-full m-1"
						src={profilePicture}
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
};

// Component for control buttons
interface ControlButtonsProps {
	onPlayClick: () => void;
	onDeleteClick: () => Promise<void>;
	onAddContributorClick: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
	onPlayClick,
	onDeleteClick,
	onAddContributorClick,
}) => (
	<div className="flex gap-2 mx-10 px-1">
		<div className="cursor-pointer " onClick={onPlayClick}>
			<img className="h-16 w-16 transition-all hover:scale-110" src={Play} />
		</div>
		<div className="cursor-pointer self-center " onClick={onDeleteClick}>
			<img
				className="h-8 w-8 transition-all opacity-80 hover:opacity-100"
				src={Trash}
			/>
		</div>
		<div
			className="cursor-pointer self-center "
			onClick={onAddContributorClick}
		>
			<img
				className="h-8 w-8 transition-all opacity-80 hover:opacity-100"
				src={Add}
			/>
		</div>
	</div>
);

//Main Playlist Page Component
const Playlist: React.FC = () => {
	const { appState } = useAppProvider();
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
	const { updateQueue } = useQueueProvider();
	const { clearMusicState } = useMusicProvider();
	const navigate = useNavigate();

	const [userData, setUserData] = useState<User>({
		id: "",
		username: "",
		email: "",
		pfp: "",
	});
	// Fetch user data
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const data: User = await getUserData(appState.user_id);
				setUserData(data);
			} catch (err) {
				console.error("Failed to fetch user data:", err);
			}
		};
		fetchUser();
	}, [appState.user_id]);

	// Fetch friends
	const [friends, setFriends] = useState<Friend[]>([]);
	const [showFriendsPopup, setShowFriendsPopup] = useState<boolean>(false);
	useEffect(() => {
		const loadFriends = async () => {
			try {
				const friendList: Friend[] = await fetchFriends(userData.id);
				setFriends(friendList);
			} catch (err) {
				console.error("Failed to fetch friends:", err);
			}
		};
		loadFriends();
	}, [userData.id]);

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
	const handleAddContributor = async (): Promise<void> =>
		setShowFriendsPopup(true);
	const handleContributorAdded = () => setShowFriendsPopup(false);

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
				<PlaylistInfo playlistData={playlistData} />
				<CreatorsInfo
					user_uuid={userData.id}
					username={userData.username}
					songCount={playlistData?.songs?.length}
				/>
			</div>
			<ControlButtons
				onPlayClick={playAllSongs}
				onDeleteClick={handleDeletePlaylist}
				onAddContributorClick={handleAddContributor}
			/>
			<SongContainer
				playlistId={playlistId || ""}
				songs={playlistData?.songs || []}
			/>
			<UploadModal
				showModal={showModal}
				onClose={() => setShowModal(false)}
				onFileChange={handleFileChange}
				onUpload={handleUpload}
				isUpdating={isUpdating}
				title="Upload Playlist Cover" // Custom title for playlist
			/>
			{showFriendsPopup && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
						<AddContibutorFriendList
							friends={friends}
							playlistId={playlistId || ""}
							playlistName={
								playlistData?.playlist?.playlist_name || "Untitled Playlist"
							}
							onContributorAdded={handleContributorAdded}
						/>
						<button
							className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-darker"
							onClick={() => setShowFriendsPopup(false)}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default Playlist;
