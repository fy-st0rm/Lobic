import React, { useState, useEffect } from "react";

// Local
import Music from "components/Music/Music";
import { MPState } from "api/musicApi";
import {
	fetchMusicList,
	incrementPlayCount,
	getMusicImageUrl,
	fetchTrendingSongs,
	fetchRecentlyPlayed,
	logSongPlay,
} from "api/musicApi";
import { fetchLikedSongs } from "api/likedSongsApi";
import { fetchTopTracks } from "api/topTracksApi";
import { useAppProvider } from "providers/AppProvider";
import { useMusicProvider } from "providers/MusicProvider";

// Assets
import "./MusicList.css";

interface MusicListProps {
	list_title: string;
	renderOnlyOnSuccess: boolean;
}

interface Song {
	id: string;
	title: string;
	artist: string;
	album?: string;
	genre?: string;
}

interface MusicState {
	id: string;
	title: string;
	artist: string;
	cover_img: string;
	timestamp: number;
	state: MPState;
}

const MusicList: React.FC<MusicListProps> = ({
	list_title,
	renderOnlyOnSuccess,
}) => {
	const [musicItems, setMusicItems] = useState<Song[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
	const [isEmpty, setEmpty] = useState<boolean>(true);

	const { appState } = useAppProvider();
	const { updateMusicState } = useMusicProvider();

	const userId = appState.user_id;

	useEffect(() => {
		loadMusicData();
	}, [list_title]);

	const loadMusicData = async (): Promise<void> => {
		let data: Song[];
		try {
			switch (list_title) {
				case "Trending Now":
					data = await fetchTrendingSongs();
					break;
				case "Recently Played":
					data = await fetchRecentlyPlayed(userId);
					break;
				case "Liked Songs":
					data = await fetchLikedSongs(userId);
					break;
				case "My Top Tracks":
					data = await fetchTopTracks(userId);
					break;
				default:
					data = await fetchMusicList();
			}
			setMusicItems(data);
			setEmpty(false);
		} catch (err) {
			const error = err as Error;
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMusicClick = async (song: Song): Promise<void> => {
		try {
			setSelectedSongId(song.id);
			setIsLoading(true);

			const coverArt = getMusicImageUrl(song.id);
			setSelectedSongId(song.id);

			await incrementPlayCount(song.id);
			await logSongPlay(userId, song.id);

			updateMusicState({
				id: song.id,
				title: song.title,
				artist: song.artist,
				cover_img: coverArt,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
		} catch (err) {
			const error = err as Error;
			console.error("Failed to handle music click:", error);
			setError("Failed to play music: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (renderOnlyOnSuccess && isEmpty) {
		return null;
	}

	return (
		<div className="music-list-container">
			<h2 className="list-title">{list_title}</h2>
			<div className="music-list">
				{musicItems.map((song) => (
					<div
						key={song.id}
						className={`music-item-wrapper ${
							selectedSongId === song.id ? "selected" : ""
						}`}
					>
						<Music
							musicId={song.id}
							title={song.title}
							artist={song.artist}
							coverArt={getMusicImageUrl(song.id)}
							onClick={() => handleMusicClick(song)}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default MusicList;
