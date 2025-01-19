// Node modules
import React, { useState, useEffect } from "react";

// Local
import Music from "components/Music/Music";
import { MPState } from "@/const";
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

function MusicList({ list_title, renderOnlyOnSuccess }) {
	const [musicItems, setMusicItems] = useState([]);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedSongId, setSelectedSongId] = useState(null);
	const [isEmpty,setEmpty] = useState(true);

	const { appState } = useAppProvider();
	const { updateMusicState } = useMusicProvider();

	const userId = appState.user_id;

	useEffect(() => {
		loadMusicData();
	}, [list_title]);

	const loadMusicData = async () => {
		let data;
		try {
			if (list_title === "Trending Now") {
				data = await fetchTrendingSongs();
			} else if (list_title === "Recently Played") {
				data = await fetchRecentlyPlayed(userId);
			} else if (list_title === "Liked Songs") {
				data = await fetchLikedSongs(userId);
			} else if (list_title === "My Top Tracks") {
				data = await fetchTopTracks(userId);
			} else {
				data = await fetchMusicList();
			}
			setMusicItems(data);
			setEmpty(false);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMusicClick = async (song) => {
		try {
			//TODO : refactor into PlaySong??
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
			});
		} catch (err) {
			console.error("Failed to handle music click:", err);
			setError("Failed to play music: " + err.message);
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
							album={song.album}
							genre={song.genre}
							onClick={() => handleMusicClick(song)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export default MusicList;
