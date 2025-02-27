import { useState, useEffect } from "react";
import { useMusicProvider, MusicState } from "providers/MusicProvider";
import { MPState, ImageFromUrl } from "@/api/music/musicApi";
import { Song } from "@/api/playlist/playlistApi";
import { getUserData } from "@/api/user/userApi";

// SongInfo Component
interface SongInfoProps {
	songName: string;
	artistName: string;
	duration: string;
	addedBy: string;
	image_url: string;
}
const SongInfo: React.FC<SongInfoProps> = ({
	songName,
	artistName,
	duration,
	addedBy,
	image_url,
}) => (
	<div className="flex justify-evenly items-center mt-0 mx-2">
		<div className="flex items-center gap-0 font-bold w-[40%] px-4 py-[2px]">
			<div className="cover h-[66px] w-[66px] py-1 self-start cursor-pointer">
				<img
					src={ImageFromUrl(image_url)}
					alt={`${songName} cover`}
					className="h-[66px] w-[66px] object-cover rounded"
				/>
			</div>
			<div className="self-start mt-5 ml-5">
				<div className="font-sans text-[100%] text-white overflow-hidden text-ellipsis whitespace-nowrap">
					{songName}
				</div>
				<div className="font-sans text-[50%] text-white opacity-65 text-nowrap overflow-hidden text-ellipsis">
					{artistName}
				</div>
			</div>
		</div>
		<div className="font-sans text-[70%] text-white font-bold w-[30%] px-4 py-2">
			{duration}
		</div>
		<div className="font-sans text-[70%] text-white font-bold w-[20%] px-4 py-2 overflow-hidden text-ellipsis whitespace-nowrap">
			{addedBy}
		</div>
	</div>
);

// SongHeader Component
const SongHeader = () => (
	<div className="sticky top-0 bg-primary-100 rounded-[18px] z-10">
		<div className="flex justify-evenly mt-2 mx-2">
			<div className="font-sans text-[70%] text-white opacity-50 font-bold w-[40%] px-4 py-2">
				TITLE
			</div>
			<div className="font-sans text-[70%] text-white opacity-50 font-bold w-[30%] px-4 py-2">
				ALBUM
			</div>
			<div className="font-sans text-[70%] text-white opacity-50 font-bold w-[20%] px-4 py-2">
				ADDED BY
			</div>
		</div>
		<div className="mx-5 h-[2px] bg-white opacity-50 rounded-[10px] my-1" />
	</div>
);

// SongList Component
interface SongListProps {
	songs: Song[];
	usernames: UserCache;
	isLoading: boolean;
	selectedSongId: string | null;
	onSongClick: (item: Song) => Promise<void>;
}
const SongList: React.FC<SongListProps> = ({
	songs,
	usernames,
	isLoading,
	selectedSongId,
	onSongClick,
}) => (
	<div className="overflow-y-auto flex-1">
		{songs.map((item) => (
			<div
				key={item.music_id}
				onClick={() => !isLoading && onSongClick(item)}
				className={`cursor-pointer hover:bg-primary-100 transition-colors rounded-sm m-2 ${
					selectedSongId === item.music_id ? "bg-primary-200" : ""
				} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
			>
				<SongInfo
					songName={item.title}
					artistName={item.artist}
					duration={item.album} // Assuming album is used as duration
					addedBy={usernames[item.song_adder_id] || "Loading..."}
					image_url={item.image_url}
				/>
			</div>
		))}
	</div>
);

// Main SongContainer Component
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
			const uniqueUserIds = [
				...new Set(songs.map((song) => song.song_adder_id)),
			];
			const newUsernames: UserCache = {};

			try {
				await Promise.all(
					uniqueUserIds.map(async (userId) => {
						const userData = await getUserData(userId);
						newUsernames[userId] = userData.username;
					}),
				);
			} catch (error) {
				console.error("Failed to fetch usernames:", error);
				uniqueUserIds.forEach((userId) => {
					newUsernames[userId] = "Unknown User";
				});
			}

			setUsernames(newUsernames);
		};

		fetchUsernames();
	}, [songs]);

	const handleSongClick = async (item: Song): Promise<void> => {
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
			console.error("Failed to update music state:", error);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="absolute bg-primary-100 bg-opacity-65 rounded-[18px] h-[70%] w-[40%] min-w-[300px] flex flex-col pb-5">
			<SongHeader />
			<SongList
				songs={songs}
				usernames={usernames}
				isLoading={isLoading}
				selectedSongId={selectedSongId}
				onSongClick={handleSongClick}
			/>
		</div>
	);
};

export default SongContainer;
