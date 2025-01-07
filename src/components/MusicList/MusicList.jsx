import React, { useState, useEffect } from 'react';
import { useAppState } from "../../AppState.jsx";
import Music from '../Music/Music';
import './MusicList.css';
import { SERVER_IP, MPState } from "../../const.jsx";

function MusicList({ list_title }) {
	const [musicItems, setMusicItems] = useState([]);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedSongId, setSelectedSongId] = useState(null);

	const { updateMusicData } = useAppState();

	// Fetch music data when the component mounts
	useEffect(() => {
		fetchMusicData();
	}, []);

	// Fetch music data from the server
	const fetchMusicData = async () => {
		try {
			const response = await fetch(`${SERVER_IP}/get_music`);
			if (!response.ok) throw new Error('Failed to fetch music data');
			const data = await response.json();
			setMusicItems(data);
			setIsLoading(false);
		} catch (err) {
			setError(err.message);
			setIsLoading(false);
		}
	};

	// Get the URL for the cover art image
	const getImageUrl = (songId) => `${SERVER_IP}/image/${songId}.png`;

	// Handle click on a music item
	const handleMusicClick = async (item) => {
		try {
			setIsLoading(true);
			const coverArt = getImageUrl(item.id);
			setSelectedSongId(item.id);

			// Updating Music State globally
			updateMusicData(
				item.id,
				item.title,
				item.artist,
				coverArt,
				MPState.CHANGE
			);
		} catch (err) {
			console.error('Failed to fetch music URL:', err);
			setError('Failed to fetch music URL: ' + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (error) return console.log(error);

	return (
		<div className="music-list-container">
			<h2 className="list-title"> {list_title} </h2>
			<div className="music-list">
				{musicItems.map((item) => (
					<div
						key={item.id}
						className={`music-item-wrapper ${
							selectedSongId === item.id ? 'selected' : ''
						}`}
						onClick={() => handleMusicClick(item)}
					>
						<Music
							title={item.title}
							artist={item.artist}
							coverArt={getImageUrl(item.id)} // Pass the cover art URL to the Music component
							album={item.album}
							genre={item.genre}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export default MusicList;
