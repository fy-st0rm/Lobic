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
import Remove from "/contributor/remove.svg";
import { UserRoundPlus } from 'lucide-react';
import UploadModal from "@/components/UploadModal";
import { fetchFriends, Friend } from "@/api/friendApi";
import { AddContibutorFriendList } from "./friendList";
import {
	fetchAllContributors,
	FetchContributorsResponse,
	removeContributor,
} from "@/api/playlist/combinedPlaylistApi";
import { set } from "date-fns";

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
	contributor_count: number;
	contributors: { user_uuid: string; username: string }[];
	userData: User;
	playlistId: string;
	handleRemoveContributor: (userId: string) => Promise<void>;
	playlistOwnerData: User;
}
const CreatorsInfo: React.FC<CreatorsInfoProps> = ({
	username,
	user_uuid,
	songCount,
	contributor_count,
	contributors,
	userData,
	handleRemoveContributor,
	playlistOwnerData,
	playlistId
}) => {
	const [profilePicture, setProfilePicture] = useState<string>("/sadit.jpg");
	const [showContributors, setShowContributors] = useState<boolean>(false);

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
				<div className="creatorname text-primary_fg pb-0.5 text-sm font-semibold self-center cursor-pointer opacity-70 hover:opacity-100 transition-all" onClick={() => { setShowContributors(!showContributors) }}>
					{username || "Unknown User"}  {!contributor_count ? '' : `& ${contributor_count} others`}
				</div>
			</div>
			<div className="text-white opacity-50 text-[7px] font-bold self-center">
				<Dot className="p-0 h-5 w-5" />
			</div>
			<div className="songcount text-white opacity-50 text-sm font-bold self-center pb-0.5">
				{songCount || 0} songs
			</div>
			{showContributors && (<div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] flex justify-center items-center z-50" onClick={() => setShowContributors(false)}>
				<div className="bg-secondary h-80 w-96 rounded-md shadow-xl max-w-3xl mx-4 overflow-hidden">

					<div className=" text-primary_fg text-xl font-bold mx-5 my-3">Contributors</div>
					<div className="h-[0.2px] w-full bg-white opacity-25"></div>
					<div className="m-2 mt-5">
						{contributors.map((contributor) => (
							<ContributorsInfo
								key={contributor.user_uuid}
								contributor={contributor}
								currentUserId={userData.id}
								playlistId={playlistId || ""}
								onRemoveContributor={handleRemoveContributor}
								isCreator={playlistOwnerData.id === userData.id}
							/>
						))}
					</div>

				</div>
			</div>)}
		</div>

	);
};

// ContributorsInfo Component
interface ContributorsInfoProps {
	contributor: {
		user_uuid: string;
		username: string;
	};
	currentUserId: string;
	playlistId: string;
	onRemoveContributor: (userId: string) => Promise<void>;
	isCreator: boolean;
}

const ContributorsInfo: React.FC<ContributorsInfoProps> = ({
	contributor,
	currentUserId,
	playlistId,
	onRemoveContributor,
	isCreator,
}) => {
	const [profilePicture, setProfilePicture] = useState<string>("/sadit.jpg");

	useEffect(() => {
		const fetchProfilePicture = async () => {
			try {
				const imageUrl: string = await fetchUserProfilePicture(
					contributor.user_uuid,
				);
				setProfilePicture(imageUrl);
			} catch (error) {
				console.error("Failed to fetch contributor profile picture:", error);
				setProfilePicture("/sadit.jpg");
			}
		};
		fetchProfilePicture();
	}, [contributor.user_uuid]);

	const handleRemoveContributor = async () => {
		try {
			await onRemoveContributor(contributor.user_uuid);
			alert(`Removed ${contributor.username} from playlist`);
		} catch (error) {
			console.error("Error removing contributor:", error);
			alert("Failed to remove contributor");
		}
	};
	return (
		<div className="flex relative justify-between top-[-9px] pr-3">
			<div className="flex gap-1">
				<div className="">
					<img
						className="h-10 w-10 rounded-full m-1"
						src={profilePicture}
						alt={`Contributor ${contributor.username}`}
					/>
				</div>
				<div className="contributorname text-white pb-0.5 text-md font-semibold self-center">
					{contributor.username || "Unknown User"}
				</div>
			</div>
			{isCreator && currentUserId !== contributor.user_uuid && (
				<div className="cursor-pointer self-center ml-2 h-8 w-8">
					<img
						className="text-sm opacity-80 hover:opacity-100"
						onClick={handleRemoveContributor}
						src={Remove}
					/>
				</div>
			)}
		</div>
	);
};

// Component for control buttons
interface ControlButtonsProps {
	onPlayClick: () => void;
	onDeleteClick: () => Promise<void>;
	onAddContributorClick: () => void;
	isPlaylistCombined?: Boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
	onPlayClick,
	onDeleteClick,
	onAddContributorClick,
	isPlaylistCombined,
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
		{isPlaylistCombined && (
			<div
				className="cursor-pointer self-center "
				onClick={onAddContributorClick}
			>
				<UserRoundPlus
					className="h-8 w-8 transition-all opacity-80 hover:opacity-100"
				
				/>
			</div>
		)}
	</div>
);

//Main Playlist Page Component
const Playlist: React.FC = () => {
	const { appState } = useAppProvider();
	const { playlistId } = useParams<{ playlistId: string }>();
	const [playlistData, setPlaylistData] = useState<PlaylistResponse | null>(
		null,
	);
	const [playlistOwnerData, setPlaylistOwnerdata] = useState<User>({
		id: "",
		username: "",
		email: "",
		pfp: "",
	});
	const [playlistCover, setPlaylistCover] = useState<string>(
		"/playlistimages/playlistimage.png",
	);

	//states for updating the cover_image
	const [showModal, setShowModal] = useState<boolean>(false); // Modal state
	const [selectedImage, setSelectedImage] = useState<File | null>(null); // Selected image
	const [isUpdating, setIsUpdating] = useState<boolean>(false); // Upload status

	const [timestamp, setTimestamp] = useState<number>(Date.now());
	const { clearMusicState, controlsDisabled } = useMusicProvider();
	const { updateQueue, clearQueue } = useQueueProvider();
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

	// Fetch contributors
	const [contributors, setContributors] = useState<
		{ user_uuid: string; username: string }[]
	>([]);
	useEffect(() => {
		const loadContributors = async () => {
			try {
				if (playlistId) {
					const contributorData: FetchContributorsResponse =
						await fetchAllContributors(playlistId);
					const contributorDetails = await Promise.all(
						contributorData.contributors.map(async (c) => {
							const user: User = await getUserData(c.contributor_user_id);
							return {
								user_uuid: c.contributor_user_id,
								username: user.username,
							};
						}),
					);
					setContributors(contributorDetails);
				}
			} catch (error) {
				console.error("Error fetching contributors:", error);
			}
		};
		loadContributors();
	}, [playlistId]);

	const handleRemoveContributor = async (contributorId: string) => {
		if (!playlistId) return;
		try {
			await removeContributor({
				playlist_id: playlistId,
				contributor_user_id: contributorId,
			});
			setContributors((prev) =>
				prev.filter((c) => c.user_uuid !== contributorId),
			);
		} catch (error) {
			console.error("Error removing contributor:", error);
			throw error;
		}
	};

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

	//fethPlaylist
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
		const loadPlaylistOwnerData = async () => {
			try {
				if (playlistData) {
					const data = await getUserData(playlistData.playlist.user_id);
					setPlaylistOwnerdata(data);
				}
			} catch (error) {
				console.error("Error:", error);
			}
		};
		loadPlaylistOwnerData();
	}, [playlistData]);

	const playAllSongs = (): void => {
		if (controlsDisabled) return;

		clearMusicState();
		clearQueue();
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
					user_uuid={playlistOwnerData.id}
					username={playlistOwnerData.username}
					songCount={playlistData?.songs?.length}
					contributor_count={contributors.length}
					contributors={contributors}
					userData={userData}
					playlistId={playlistId || ""}
					handleRemoveContributor={handleRemoveContributor}
					playlistOwnerData={playlistOwnerData}
				/>
			</div>
			<ControlButtons
				onPlayClick={playAllSongs}
				onDeleteClick={handleDeletePlaylist}
				onAddContributorClick={handleAddContributor}
				isPlaylistCombined={playlistData?.playlist.is_playlist_combined}

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
				title="Upload Playlist Cover"
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
