import React, { useState, useEffect } from "react";
import { useAppState } from "../../AppState.jsx";
import Music from "../Music/Music";
import "./MusicList.css";
import { MPState } from "../../const.jsx";
import {
	fetchMusicList,
	incrementPlayCount,
	getMusicImageUrl,
} from "../../api/musicApi.js";

function MusicList({ list_title }) {
	const [musicItems, setMusicItems] = useState([]);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedSongId, setSelectedSongId] = useState(null);

	const { updateMusicState } = useAppState();

	useEffect(() => {
		loadMusicData();
	}, [list_title]);

	const loadMusicData = async () => {
		try {
			const isTrending = list_title === "Trending Now";
			const data = await fetchMusicList(isTrending);
			setMusicItems(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMusicClick = async (item) => {
		try {
			setIsLoading(true);
			const coverArt = getMusicImageUrl(item.id);
			setSelectedSongId(item.id);

			await incrementPlayCount(item.id);

			updateMusicState({
				has_item: true,
				id: item.id,
				title: item.title,
				artist: item.artist,
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

	if (error) return console.log(error);

	return (
		<div className="music-list-container">
			<h2 className="list-title">{list_title}</h2>
			<div className="music-list">
				{musicItems.map((item) => (
					<div
						key={item.id}
						className={`music-item-wrapper ${
							selectedSongId === item.id ? "selected" : ""
						}`}
					>
						<Music
							title={item.title}
							artist={item.artist}
							coverArt={getMusicImageUrl(item.id)}
							album={item.album}
							genre={item.genre}
							onClick={() => handleMusicClick(item)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export default MusicList;
