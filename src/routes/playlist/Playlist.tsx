import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SongContainer from "../../components/SongContainer/SongContainer";
import PlaylistImage from "/playlistimages/playlistimage.png";
import User1 from "/user_images/manish.jpg";
import User2 from "/user_images/sameep.jpg";
import { Dot } from "lucide-react";
import { useAppProvider } from "providers/AppProvider";

import {
	fetchPlaylistById,
	PlaylistResponse,
	Playlist as PlaylistType, // Renamed to avoid conflict
	Song,
} from "../../api/playlistApi";

function Playlist() {
	const { appState } = useAppProvider();
	const currentUserId = appState.user_id;
	const { playlistId } = useParams<{ playlistId: string }>();
	const [playlistData, setPlaylistData] = useState<PlaylistResponse | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadPlaylistData = async () => {
			try {
				if (playlistId) {
					const data: PlaylistResponse = await fetchPlaylistById(playlistId);
					setPlaylistData(data);
				}
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "An unknown error occurred",
				);
			} finally {
				setIsLoading(false);
			}
		};

		loadPlaylistData();
	}, [playlistId]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<>
			<div className="absolute flex gap-6 top-[20%] left-[10%] playlistinfo h-[50%] w-[20%]">
				<div className="playlistcover relative self-center rounded-[10px]">
					<img
						src={PlaylistImage}
						className="h-[50%] w-[28.125]"
						alt="Playlist Cover"
					/>
				</div>
				<div className="playlistinfo self-center">
					<div className="playlistname text-white text-[50px] font-bold text-nowrap">
						{playlistData?.playlist?.playlist_name || "Untitled Playlist"}
					</div>
					<div className="typeofplaylist text-white text-[15px] relative pl-2 top-[-9px] font-thin">
						{playlistData?.playlist?.description || "Combined Playlist"}
					</div>
					<div className="infobar flex relative top-[-9px]">
						<div className="playlistcreators flex gap-2">
							<div className="creatorimg px-1 py-[2px]">
								<img
									className="absolute h-[20px] w-[20px] rounded-full"
									src={User1}
									alt="Creator 1"
								/>
								<img
									className="relative left-2 h-[20px] w-[20px] rounded-full"
									src={User2}
									alt="Creator 2"
								/>
							</div>
							<div className="creatorname text-white opacity-50 pb-0.5 text-[8px] font-bold self-center">
								{currentUserId || "Unknown User"} and 1 other
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
						<div className="playbutton"></div>
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
