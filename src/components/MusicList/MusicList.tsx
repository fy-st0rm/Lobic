import React, { useState, useEffect, useCallback } from "react";
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
import { useMusicLists } from "@/contexts/MusicListContext";
import { useQueueProvider } from "providers/QueueProvider";

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

type ListLoaderMap = {
	[key: string]: (userId: string) => Promise<Song[]>;
};

const listLoaders: ListLoaderMap = {
	"Trending Now": () => fetchTrendingSongs(),
	"Recently Played": (userId: string) => fetchRecentlyPlayed(userId),
	"Liked Songs": (userId: string) => fetchLikedSongs(userId),
	"My Top Tracks": (userId: string) => fetchTopTracks(userId),
	"Featured Music": () => fetchMusicList(),
};

const MusicList: React.FC<MusicListProps> = ({
	list_title,
	renderOnlyOnSuccess,
}) => {
	const [musicItems, setMusicItems] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
	const [isEmpty, setEmpty] = useState<boolean>(true);

	const { appState } = useAppProvider();
	const { updateMusicState } = useMusicProvider();
	const { queue, enqueue } = useQueueProvider();

	const { notifyMusicPlayed, registerReloadHandler } = useMusicLists();

	const userId = appState.user_id;

	const loadMusicData = useCallback(async (): Promise<void> => {
		setIsLoading(true);

		try {
			const loader = listLoaders[list_title] || listLoaders["Featured Music"];
			const data = await loader(userId);
			setMusicItems(data);
			setEmpty(data.length === 0);
		} catch (err) {
			const error = err as Error;
			console.error(`Error loading ${list_title}:`, error);
		} finally {
			setIsLoading(false);
		}
	}, [list_title, userId]);

	useEffect(() => {
		// Register this list's reload handler
		const cleanup = registerReloadHandler(list_title as any, loadMusicData);

		// Initial load
		loadMusicData();

		return cleanup;
	}, [list_title, loadMusicData, registerReloadHandler]);

	const handleMusicClick = async (song: Song): Promise<void> => {
		try {
			setSelectedSongId(song.id);
			setIsLoading(true);

			const coverArt = getMusicImageUrl(song.id);

			await Promise.all([
				incrementPlayCount(song.id),
				logSongPlay(userId, song.id),
			]);

			updateMusicState({
				id: song.id,
				title: song.title,
				artist: song.artist,
				cover_img: coverArt,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);

			// Notify other lists that a song was played
			notifyMusicPlayed(song.id, list_title as any);
		} catch (err) {
			const error = err as Error;
			console.error("Failed to handle music click:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const enqueueAllSongs = (): void => {
		musicItems.forEach((song) => {
			const track = {
				id: song.id,
				title: song.title,
				artist: song.artist,
				cover_img: getMusicImageUrl(song.id),
			};
			enqueue(track); // Enqueue each song
		});
	};

	if (renderOnlyOnSuccess && isEmpty) {
		return null;
	}

	return (
		<div className="music-list-container">
			<div className="list-header">
				<h2 className="list-title">{list_title}</h2>
				<button onClick={enqueueAllSongs} className="log-songs-button">
					Enqueue All Songs
				</button>
			</div>
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
