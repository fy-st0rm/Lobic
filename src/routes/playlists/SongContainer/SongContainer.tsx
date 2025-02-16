import { useState, useEffect } from "react";
import SongInfo from "@/routes/playlists/SongContainer/SongInfo/SongInfo";
import { useMusicProvider, MusicState } from "providers/MusicProvider";
import { MPState } from "@/api/music/musicApi";
import { Song } from "@/api/playlist/playlistApi";
import { getUserData } from "@/api/user/userApi";

interface SongContainerProps {
	playlistId: string;
	songs: Song[];
}

interface UserCache {
	[key: string]: string;
}

const SongContainer: React.FC<SongContainerProps> = ({ playlistId, songs }) => {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
	const [usernames, setUsernames] = useState<UserCache>({});
	const { updateMusicState } = useMusicProvider();

	useEffect(() => {
		const fetchUsernames = async () => {
			// Get unique user IDs
			const uniqueUserIds = [
				...new Set(songs.map((song) => song.song_adder_id)),
			];

			// Create a map to store usernames
			const newUsernames: UserCache = {};

			// Fetch usernames for all unique user IDs
			await Promise.all(
				uniqueUserIds.map(async (userId) => {
					try {
						const userData = await getUserData(userId);
						newUsernames[userId] = userData.username;
					} catch (error) {
						console.error(
							`Failed to fetch username for user ${userId}:`,
							error,
						);
						newUsernames[userId] = "Unknown User";
					}
				}),
			);

			setUsernames(newUsernames);
		};

		fetchUsernames();
	}, [songs]);

	const handleMusicClick = async (item: Song): Promise<void> => {
		try {
			setIsLoading(true);
			setSelectedSongId(item.music_id);

			updateMusicState({
				id: item.music_id,
				title: item.title,
				artist: item.artist,
				image_url: item.image_url,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
		} catch (err) {
			const error = err as Error;
			console.error("Failed to fetch music URL:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="absolute top-[14%] right-[4%] bg-primary-100 bg-opacity-65 rounded-[18px] h-[70%] w-[40%] min-w-[300px] flex flex-col pb-5">
			{/* Header */}
			<div className="sticky top-0 bg-primary-100 rounded-[18px] z-10">
				<div className="flex justify-evenly mt-2 mx-2">
					<div className="font-sans text-[70%] text-white opacity-50 font-bold w-[40%] px-4 py-2">
						TITLE
					</div>
					<div className="font-sans text-[70%] text-white opacity-50 font-bold duration w-[30%] px-4 py-2">
						ALBUM
					</div>
					<div className="font-sans text-[70%] text-white opacity-50 font-bold addedby w-[20%] px-4 py-2 overflow-hidden text-nowrap">
						ADDED BY
					</div>
				</div>
				<div className="mx-5 left-1 h-[2px] bg-white opacity-50 rounded-[10px] my-1"></div>
			</div>

			{/* Song List */}
			<div className="overflow-y-auto flex-1">
				{songs.map((item) => (
					<div
						key={item.music_id}
						onClick={() => handleMusicClick(item)}
						className="cursor-pointer hover:bg-primary-100 transition-colors rounded-sm m-2"
					>
						<SongInfo
							songName={item.title}
							artistName={item.artist}
							duration={item.album}
							addedBy={usernames[item.song_adder_id] || "Loading..."}
							image_url={item.image_url}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default SongContainer;
