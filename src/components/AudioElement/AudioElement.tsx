// Node modules
import { useEffect } from "react";
import ReactDOM from "react-dom";

// Local
import {
	MusicTrack,
	MPState,
	fetchMusicUrl,
	updateHostMusicState,
} from "@/api/music/musicApi";
import { useAppProvider } from "providers/AppProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useMusicProvider } from "providers/MusicProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useQueueProvider } from "providers/QueueProvider";

const AudioElement = () => {
	const { appState, updateAppState } = useAppProvider();
	const { lobbyState } = useLobbyProvider();
	const {
		audioRef,
		musicState,
		updateMusicState,
		getAudioElement,
		setControlsDisabled,
	} = useMusicProvider();
	const { queue, dequeue } = useQueueProvider();
	const { getSocket } = useSocketProvider();

	// If page is refreshed initializing the audio
	useEffect(() => {
		// Initializing the audio if the music exists in state
		const init_audio = async () => {
			if (musicState.id === null) return;

			const audioElement = getAudioElement();
			if (audioElement === null) return;

			updateMusicState({
				state: MPState.PAUSE,
				timestamp: 0,
			});

			audioElement.src = await fetchMusicUrl(musicState.id);
			audioElement.volume = musicState.volume / 100;
			audioElement.currentTime = 0;
			await audioElement.pause();
		};
		init_audio();
	}, []);

	// Handling controls access
	useEffect(() => {
		if (lobbyState.in_lobby && lobbyState.is_host) {
			setControlsDisabled(false);
		} else if (lobbyState.in_lobby && !lobbyState.is_host) {
			setControlsDisabled(true);
		} else if (!lobbyState.in_lobby) {
			setControlsDisabled(false);
		}
	}, [lobbyState.in_lobby, musicState.id]);

	// Music State Handler
	useEffect(() => {
		const audioElement = getAudioElement();

		if (audioElement === null) {
			console.log("AudioElement is missing");
			return;
		}

		if (musicState.id === null) {
			audioElement.src = "";
			audioElement.currentTime = 0;
		}

		const musicStateManager = async () => {
			if (musicState.state === MPState.PLAY) {
				if (audioElement.paused && audioElement.readyState > 3)
					await audioElement.play();
			} else if (musicState.state === MPState.PAUSE) {
				if (!audioElement.paused && audioElement.readyState > 3)
					await audioElement.pause();
			} else if (musicState.state === MPState.CHANGE_MUSIC) {
				try {
					audioElement.src = await fetchMusicUrl(musicState.id);
					audioElement.volume = musicState.volume / 100;
					audioElement.currentTime = 0;
					audioElement.load();
				} catch (err) {
					console.error("Failed to play music:", err);
				} finally {
					updateMusicState({ state: MPState.PLAY, timestamp: 0 });
				}
			} else if (musicState.state === MPState.CHANGE_TIME) {
				let time = musicState.state_data;
				audioElement.currentTime = time;
				if (audioElement.paused) {
					updateMusicState({ state: MPState.PAUSE, state_data: 0, timestamp: time });
				} else {
					updateMusicState({ state: MPState.PLAY, state_data: 0, timestamp: time });
				}
			} else if (musicState.state === MPState.CHANGE_VOLUME) {
				let vol = musicState.state_data;
				audioElement.volume = vol / 100;
				if (audioElement.paused) {
					updateMusicState({ state: MPState.PAUSE, state_data: 0, volume: vol });
				} else {
					updateMusicState({ state: MPState.PLAY, state_data: 0, volume: vol });
				}
			} else if (musicState.state === MPState.EMPTY) {
				audioElement.src = "";
				audioElement.currentTime = 0;
			}

			// Responsible to set the music state of the lobby as a host
			// TODO: This sends the update request to server every frame (might be laggy)
			if (lobbyState.is_host) {
				updateHostMusicState(getSocket(), appState, lobbyState, musicState);
			}
		};

		musicStateManager();
	}, [musicState]);

	// Event listeners for audio element
	useEffect(() => {
		const audioElement = getAudioElement();
		if (!audioElement) return;

		// Only update if audio is actually playing
		const timeUpdateHandler = () => {
			if (audioElement.paused || audioElement.ended) return;
			updateMusicState({ timestamp: audioElement.currentTime });
		};

		const loadedMetadataHandler = () => {
			if (!audioElement.duration) return;
			updateMusicState({ duration: audioElement.duration });
		};

		audioElement.addEventListener("timeupdate", timeUpdateHandler);
		audioElement.addEventListener("loadedmetadata", loadedMetadataHandler);

		// Cleanup event listeners on component unmount
		return () => {
			audioElement.removeEventListener("timeupdate", timeUpdateHandler);
			audioElement.removeEventListener("loadedmetadata", loadedMetadataHandler);
		};
	}, []);

	// Called when a music is ended
	const handleOnEnded = () => {
		// Getting next track from queue
		let nextTrack: MusicTrack | null = dequeue();

		console.log("Ended");

		// If there exists a track then play that
		if (nextTrack) {
			updateMusicState({
				id: nextTrack.id,
				title: nextTrack.title,
				artist: nextTrack.artist,
				album: nextTrack.album,
				image_url: nextTrack.image_url,
				state: MPState.CHANGE_MUSIC,
				state_data: 0,
				timestamp: 0,
			});
			return;
		}

		// Else just remove the song
		updateMusicState({
			id: null,
			title: null,
			artist: null,
			album: null,
			image_url: null,
			state: MPState.EMPTY,
			state_data: 0,
			timestamp: 0,
			duration: 0,
		});
	};

	return ReactDOM.createPortal(
		<audio ref={audioRef} onEnded={handleOnEnded} />,
		document.body,
	);
};

export default AudioElement;
