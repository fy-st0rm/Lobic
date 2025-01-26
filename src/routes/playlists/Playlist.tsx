import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SongContainer from "@/components/SongContainer/SongContainer";
import User2 from "/user_images/sameep.jpg"; // @TODO
import { Dot, Edit, Play } from "lucide-react";
import { useAppProvider } from "providers/AppProvider";
import { getUserData, fetchUserProfilePicture } from "@/api/userApi";
import { getMusicImageUrl, MPState } from "api/musicApi";
import { useQueueProvider } from "providers/QueueProvider";
import { useMusicProvider, MusicState } from "providers/MusicProvider";
import {
	fetchPlaylistById,
	PlaylistResponse,
	updatePlaylistCoverImg,
	fetchPlaylistCoverImg,
} from "../../api/playlistApi";

function Playlist({}) {
	const { appState } = useAppProvider();
	const currentUserId = appState.user_id;
	const { playlistId } = useParams<{ playlistId: string }>();
	const [playlistData, setPlaylistData] = useState<PlaylistResponse | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [playlistCover, setPlaylistCover] = useState<string>(
		"/playlistimages/playlistimage.png",
	);
	const [timestamp, setTimestamp] = useState<number>(Date.now());
	const [username, setUsername] = useState<string>("");
	const { queue, enqueue, dequeue, clearQueue } = useQueueProvider();
	const { clearMusicState, updateMusicState } = useMusicProvider();

	const [user1Pfp, setUser1Pfp] = useState<string>("/public/sadit.jpg");

	useEffect(() => {
		const loadPlaylistData = async (): Promise<void> => {
			try {
				if (playlistId) {
					const data: PlaylistResponse = await fetchPlaylistById(playlistId);
					setPlaylistData(data);
					const coverImageUrl = await fetchPlaylistCoverImg(playlistId);
					setPlaylistCover(coverImageUrl);
				}
			} catch (error) {
				console.error("Error:", error);
			} finally {
				setIsLoading(false);
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
					const pfpUrl = await fetchUserProfilePicture(currentUserId);
					setUser1Pfp(pfpUrl);
				} catch (error) {
					console.error("Error fetching user data:", error);
				}
			}
		};

		fetchUser();
	}, [currentUserId]);

	const playlistPlayed = () => {
		clearMusicState();
		clearQueue();

		let firstSong = playlistData?.songs[0];

		if (firstSong) {
			const coverArt = getMusicImageUrl(firstSong.artist, firstSong.album);
			updateMusicState({
				id: firstSong.music_id,
				title: firstSong.title,
				artist: firstSong.artist,
				cover_img: coverArt,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
		}

		playlistData?.songs.slice(1).forEach((item) => {
			const coverArt = getMusicImageUrl(item.artist, item.album);
			let track = {
				id: item.music_id,
				cover_img: coverArt,
				...item,
			};
			enqueue(track);
		});
	};

	const handleImageChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file || !playlistId) return;

		try {
			const tempImageUrl = URL.createObjectURL(file);
			setPlaylistCover(tempImageUrl);

			await updatePlaylistCoverImg(playlistId, tempImageUrl);
			setTimestamp(Date.now());

			const newImageUrl = `${await fetchPlaylistCoverImg(playlistId)}?t=${Date.now()}`;
			setPlaylistCover(newImageUrl);

			URL.revokeObjectURL(tempImageUrl);
		} catch (error) {
			console.error("Error updating playlist cover image:", error);
			setPlaylistCover("/playlistimages/playlistimage.png");
		}
	};

	return (
		<>
			<div className="absolute flex gap-6 top-[20%] left-[10%] playlistinfo h-[50%] w-[50%]">
				<div className="playlistcover relative self-center rounded-[10px] h-[50%] w-[28.125] overflow-hidden">
					<img
						// playlist-cover-image
						src={`${playlistCover}?t=${timestamp}`}
						className="w-full h-full object-cover"
						alt="Playlist Cover"
					/>
					{/* {form to update the cover newImageUrl} */}
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
						onChange={handleImageChange}
					/>
				</div>

				<div className="playlistinfo self-center">
					<div className="playlistname text-white text-[50px] font-bold text-nowrap w-50">
						{playlistData?.playlist?.playlist_name || "Untitled Playlist"}
					</div>
					<div className="typeofplaylist text-white text-[15px] relative text-lg pl-1 top-[-9px] font-thin">
						{playlistData?.playlist?.is_playlist_combined
							? "Combined Playlist"
							: "Solo Playlist"}
					</div>
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
							{playlistData?.songs?.length || 0} songs
						</div>
					</div>
					<div className="controlbuttons">
						<div className="playbutton cursor-pointer" onClick={playlistPlayed}>
							<Play className="bg-[black] text-slate-300 rounded-full p-2 text-lg hover:bg-opacity-80 " />
						</div>
						<div className="addtoplaylist"></div>
					</div>
				</div>
			</div>
			<SongContainer
				playlistId={playlistId || ""}
				songs={playlistData?.songs || []}
			/>
		</>
	);
}

export default Playlist;
