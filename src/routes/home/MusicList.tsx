import React, { useState, useEffect, useCallback } from "react";
import Music from "@/routes/home/Music";
import { MPState } from "@/api/music/musicApi";
import { fetchMusicList, MusicTrack as Song } from "@/api/music/musicApi";
import { fetchLikedSongs } from "@/api/music/likedSongsApi";
import { fetchTopTracks } from "@/api/music/topTracksApi";
import { fetchRecentlyPlayed } from "@/api/music/recentlyPlayedApi";
import { fetchTrendingSongs } from "@/api/music/trendingApi";
import { useAppProvider } from "providers/AppProvider";
import { useMusicProvider, MusicState } from "providers/MusicProvider";
import { useMusicLists } from "@/providers/MusicListContextProvider";
import { useQueueProvider } from "providers/QueueProvider";
import { useNavigate } from "react-router-dom";

import "./MusicList.css";

// Define ListType as a union of specific strings
type ListType =
	| "Trending Now"
	| "Recently Played"
	| "Liked Songs"
	| "My Top Tracks"
	| "Featured Music";

interface MusicListProps {
	list_title: ListType; // Update the type to ListType
}

type ListLoaderMap = {
	[key in ListType]: (userId: string) => Promise<Song[]>;
};

const listLoaders: ListLoaderMap = {
	"Trending Now": () => fetchTrendingSongs(),
	"Recently Played": (userId: string) => fetchRecentlyPlayed(userId),
	"Liked Songs": (userId: string) => fetchLikedSongs(userId),
	"My Top Tracks": (userId: string) => fetchTopTracks(userId),
	"Featured Music": () => fetchMusicList(),
};

const MusicList: React.FC<MusicListProps> = React.memo(({ list_title }) => {
	const navigate = useNavigate();
	const [musicItems, setMusicItems] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
	const [isEmpty, setEmpty] = useState<boolean>(true);

	const { appState } = useAppProvider();
	const { updateMusicState } = useMusicProvider();
	const { enqueue } = useQueueProvider();
	const { notifyMusicPlayed, registerReloadHandler } = useMusicLists();

	const userId = appState.user_id;

	const loadMusicData = useCallback(async (): Promise<void> => {
		setIsLoading(true);

		try {
			const loader = listLoaders[list_title]; // No need for fallback since list_title is guaranteed to be a valid key
			const data = await loader(userId);
			setMusicItems(data);
			setEmpty(data.length === 0);
		} catch (err) {
			console.error(`Error loading ${list_title}:`, err);
		} finally {
			setIsLoading(false);
		}
	}, [list_title, userId]);

	useEffect(() => {
		// Register this list's reload handler
		const cleanup = registerReloadHandler(list_title, loadMusicData);

		// Initial load
		loadMusicData();

		return cleanup;
	}, [list_title, loadMusicData, registerReloadHandler]);

	const handleMusicClick = async (song: Song): Promise<void> => {
		try {
			setSelectedSongId(song.id);
			updateMusicState({
				id: song.id,
				title: song.title,
				artist: song.artist,
				image_url: song.image_url,
				timestamp: 0,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);

			// Notify other lists that a song was played
			notifyMusicPlayed(song.id, list_title);
		} catch (err) {
			console.error("Failed to handle music click:", err);
		}
	};

	const enqueueAllSongs = (): void => {
		musicItems.forEach((song) => {
			const track = {
				id: song.id,
				title: song.title,
				artist: song.artist,
				album: song.album,
				image_url: song.image_url,
			};
			enqueue(track); // Enqueue each song
		});
	};

	const handleShowAll = (): void => {
		navigate("/show_all", { state: { listTitle: list_title } });
	};

	if (isEmpty) {
		return null;
	}
	return (
		<div className="music-list-container">
			<div className="list-header">
				<h2 className="list-title px-1 my-0 text-3xl text-primary_fg">{list_title}</h2>
				<div className="button-container">
					<div onClick={enqueueAllSongs} className="log-songs-button">Enqueue</div>
					<div onClick={handleShowAll} className="show-all-button">Show All</div>
				</div>
			</div>
			<div className="music-list">
				{musicItems.map((song) => (
					<div key={song.id} className={`music-item-wrapper ${selectedSongId === song.id ? "selected" : ""}`}>
						<Music
							musicId={song.id}
							title={song.title}
							artist={song.artist}
							album={song.album}
							image_url={song.image_url}
							onClick={() => handleMusicClick(song)}
						/>
					</div>
				))}
			</div>
		</div>
	);
	
});

export default MusicList;
