import React from "react";
import { fetchRecentlyPlayed } from "@/api/music/recentlyPlayedApi";
import { useAppProvider } from "@/providers/AppProvider";
import { useState } from "react";
import { MusicTrack as Song } from "@/api/music/musicApi";
import Music from "@/routes/home/Music";

const PlaylistContainer: React.FC = () => {
	const { appState } = useAppProvider();
	const [musicItems, setMusicItems] = useState<Song[]>([]);
	const userId = appState.user_id;

	React.useEffect(() => {
		const loadMusicData = async (): Promise<void> => {
			const data = await fetchRecentlyPlayed(userId);
			setMusicItems(data);
		};

		loadMusicData();
	}, [userId]);

	return (
		<div className="">
			<h2 className="text-white text-3xl font-bold mb-4 px-3">
				Recently Played
			</h2>
			<div className="flex flex-wrap overflow-hidden w-[100%]">
				{musicItems.map((song) => (
					<Music
						musicId={song.id}
						title={song.title}
						artist={song.artist}
						album={song.album}
						image_url={song.image_url}
						onClick={() => {}}
					/>
				))}
			</div>
		</div>
	);
};

export default PlaylistContainer;
