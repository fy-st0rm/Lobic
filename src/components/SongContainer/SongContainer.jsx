import { useState } from "react";
import SongInfo from "../SongInfo/SongInfo";
import { MPState } from "../../const.jsx";
import { useAppState } from "../../AppState.jsx";
import { getMusicImageUrl } from "../../api/musicApi.ts";

function SongContainer({ playlistId, songs }) {
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedSongId, setSelectedSongId] = useState(null);
	const { updateMusicState } = useAppState();

	const handleMusicClick = async (item) => {
		try {
			setIsLoading(true);
			const coverArt = getMusicImageUrl(item.music_id);
			setSelectedSongId(item.music_id);

			// Updating Music State globally
			updateMusicState({
				has_item: true,
				id: item.music_id,
				title: item.title,
				artist: item.artist,
				cover_img: coverArt,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			});
		} catch (err) {
			console.error("Failed to fetch music URL:", err);
			setError("Failed to fetch music URL: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (error) console.error(error);

	return (
		<div className="absolute top-[11%] right-[4%] bg-primary-100 opacity-65 rounded-[18px] h-[75%] w-[40%] min-w-[300px] flex flex-col pb-5">
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
						className="cursor-pointer hover:bg-gray-700 transition-colors"
					>
						<SongInfo
							songName={item.title}
							artistName={item.artist}
							duration={item.album}
							addedBy="Unknown" // Placeholder since `addedBy` is not in the data
							coverImg={getMusicImageUrl(item.music_id)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export default SongContainer;
