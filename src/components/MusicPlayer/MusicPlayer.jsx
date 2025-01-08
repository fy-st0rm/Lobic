import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppState } from "../../AppState.jsx";
import previousButton from "/controlbar/PreviousButton.svg";
import playButton from "/controlbar/ButtonPlay.svg";
import pauseButton from "/controlbar/ButtonPause.svg";
import NextButton from "/controlbar/ButtonNext.svg";
import VolumeLow from "/volumecontrols/Volume Level Low.png";
import Mute from "/volumecontrols/Volume Mute.png";
import VolumeHigh from "/volumecontrols/Volume Level High.png";
import placeholder_logo from "/covers/cover.jpg";
import "./MusicPlayer.css";
import { SERVER_IP, wsSend, OpCode, MPState, fetchMusicUrl } from "../../const.jsx";

function debounce(func, wait) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

function MusicPlayer() {
	const [volume, setVolume] = useState(50); // Global volume state
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [seeking, setSeeking] = useState(false);
	const [initialVolume, setInitialVolume] = useState(50); // For mute toggle
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const { ws, appState, audioRef, addMsgHandler, musicState, updateMusicData, updateMusicTs, updateMusicState } = useAppState();

	const formatTime = (time) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	};

	const resetAudioRef = async () => {
		if (audioRef.current) {
			await audioRef.current.pause();
			audioRef.current.src = ''; // Clear the previous source
			await audioRef.current.load(); // Reset the audio element
		}
	
		setCurrentTime(0); // Reset the current time
		setDuration(0); // Reset the duration
		setError(''); // Clear any errors
	}

	useEffect(() => {
		addMsgHandler(OpCode.SYNC_MUSIC, (res) => {
			console.log(res);
			let music = res.value;
			updateMusicData(
				music.id,
				music.title,
				music.artist,
				music.cover_img,
				music.timestamp,
				music.state
			);

			if (audioRef.current) {
				audioRef.current.currentTime = music.timestamp;
			}
		});

		if (!appState.in_lobby) return;

		const payload = {
			op_code: OpCode.SYNC_MUSIC,
			value: {
				lobby_id: appState.lobby_id
			}
		}
		wsSend(ws, payload);
	}, []);

	// Responsible to set the music state of the lobby as a host
	useEffect(() => {
		if (!appState.in_lobby) return;
		if (!musicState.has_item) return;

		const payload = {
			op_code: OpCode.SET_MUSIC_STATE,
			value: {
				lobby_id: appState.lobby_id,
				user_id: appState.user_id,
				music_id: musicState.id,
				title: musicState.title,
				artist: musicState.artist,
				cover_img: musicState.cover_img,
				timestamp: musicState.timestamp,
				state: musicState.state,
			}
		}
		wsSend(ws, payload);
	}, [musicState]);

	// Responsible for playing a song whenever the music state is changed
	useEffect(() => {
		if (!musicState.has_item) return;
		if (!audioRef.current) return;

		if (musicState.state === MPState.PLAYING) {
			audioRef.current.play();
		}
		else if (musicState.state === MPState.CHANGE) {
			setIsLoading(true);

			const playNewSong = async () => {
				try {
					await resetAudioRef();
					audioRef.current.src = await fetchMusicUrl(musicState.id);
					// Set the volume only once when the song is loaded
					audioRef.current.volume = volume / 100; // Set volume after loading song
				} catch (err) {
					console.error('Failed to autoplay:', err);
					setError('Failed to autoplay: ' + err.message);
				} finally {
					setIsLoading(false);
					updateMusicState(MPState.PLAYING);
				}
			};
			playNewSong();
		}
		else if (musicState.state === MPState.PAUSE) {
			audioRef.current.pause();
		}
	}, [musicState]);

	const handlePlayMusic = async () => {
		try {
			if (!musicState.has_item) {
				throw new Error('No song selected');
			}

			if (musicState.state == MPState.PLAYING) {
				updateMusicTs(audioRef.current.currentTime);
				updateMusicState(MPState.PAUSE);
			}
			else if (musicState.state == MPState.PAUSE) {
				setIsLoading(true);
				setError('');
				updateMusicTs(audioRef.current.currentTime);
				updateMusicState(MPState.PLAYING);
			}
		} catch (err) {
			console.error('Failed to load/play music:', err);
			setError('Failed to load music: ' + err.message);
			updateMusicState(MPState.PAUSE);
		} finally {
			setIsLoading(false);
		}
	};

	const onVolumeChange = (e) => {
		const newVolume = e.target.value;
		
		setVolume(newVolume); // Update the volume state
		if (audioRef.current) {
			audioRef.current.volume = newVolume / 100; // Update volume directly without restarting
		}
	};

	const volumeToggle = () => {
		if (volume > 0) {
			setInitialVolume(volume); // Save the current volume before muting
			setVolume(0);
			audioRef.current.volume = 0;
		} else {
			setVolume(initialVolume); // Restore saved volume when unmuted
			audioRef.current.volume = initialVolume / 100;
		}
	};

	const handleTimeUpdate = () => {
		if (!seeking) {
			setCurrentTime(audioRef.current.currentTime);
		}
	};

	const handleLoadedMetadata = () => {
		setDuration(audioRef.current.duration);
	};

	const handleSeekStart = () => {
		setSeeking(true);
	};

	const handleSeekEnd = (e) => {
		setSeeking(false);
		const seekTime = (e.target.value / 100) * duration;
		audioRef.current.currentTime = seekTime;
		setCurrentTime(seekTime);
		updateMusicTs(seekTime);
	};

	const handleSeekMove = (e) => {
		const seekTime = (e.target.value / 100) * duration;
		setCurrentTime(seekTime);
		updateMusicTs(seekTime);
	};

	useEffect(() => {
		const audioElement = audioRef.current;
		audioElement.addEventListener('timeupdate', handleTimeUpdate);
		audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

		return () => {
			audioElement.removeEventListener('timeupdate', handleTimeUpdate);
			audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
		};
	}, [seeking]);

	return (
		<div className="music-player">
			<div>
				<img
					src={musicState.has_item ? `${SERVER_IP}/image/${musicState.id}.png` : placeholder_logo}
					alt="Album cover"
					className="cover-image"
				/>
			</div>
			<div className="song-info">
				<div className="song-name">{musicState.has_item ? musicState.title : 'No Song Selected'}</div>
				<div className="artist-name">{musicState.has_item ? musicState.artist : ''}</div>
			</div>
			<div className="control-container">
				<div className="control-bar">
					<button className="control-button" disabled={isLoading}>
						<img src={previousButton} alt="Previous" className="button-group" />
					</button>
					<button className="control-button" onClick={handlePlayMusic} disabled={isLoading}>
						<img
							src={musicState.state === MPState.PLAYING ? pauseButton : playButton }
							alt={musicState.state === MPState.PLAYING ? "Pause" : "Play"}
							className="button-group"
						/>
					</button>
					<button className="control-button" disabled={isLoading}>
						<img src={NextButton} alt="Next" className="button-group" />
					</button>
				</div>
				<div className="status">
					<div className="music-status">{formatTime(currentTime)}</div>
					<input
						type="range"
						min="0"
						max="100"
						value={(currentTime / duration) * 100 || 0}
						onChange={handleSeekMove}
						onMouseDown={handleSeekStart}
						onMouseUp={handleSeekEnd}
						onTouchStart={handleSeekStart}
						onTouchEnd={handleSeekEnd}
						className="status-bar"
						disabled={isLoading}
					/>
				</div>
			</div>

			<div className="volume-status">
				<button className="volume-button" onClick={volumeToggle} disabled={isLoading}>
					<img
						className="volume-image"
						src={volume == 0 ? Mute : volume > 40 ? VolumeHigh : VolumeLow}
						alt="Volume"
					/>
				</button>
				<input
					type="range"
					min="0"
					max="100"
					value={volume}
					onChange={onVolumeChange}
					className="volume-control-bar"
					disabled={isLoading}
				/>
			</div>
		</div>
	);
}

export default MusicPlayer;
