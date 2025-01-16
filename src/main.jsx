import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import ReactDOM from "react-dom";

import App from "./App.jsx";
import { AppStateProvider, useAppState } from "./AppState.jsx";
import { MPState, fetchMusicUrl } from "./const.jsx";

import "./index.css";

// Global audio element
const AudioElement = () => {
	const {
		audioRef,
		appState,
		musicState,
		updateAppState,
		updateMusicState,
		setControlsDisabled,
	} = useAppState();

	// If page is refreshed initializing the audio
	useEffect(() => {
		// Initializing the audio if the music exists in state
		const init_audio = async () => {
			if (!musicState.has_item) return;
			if (!audioRef.current) return;

			updateMusicState({
				state: MPState.PAUSE,
				timestamp: 0,
			});

			if (!audioRef.current) return;
			audioRef.current.src = await fetchMusicUrl(musicState.id);
			await audioRef.current.pause();
		};
		init_audio();
	}, []);

	// Handling controls access
	useEffect(() => {
		if (!musicState.has_item) {
			setControlsDisabled(true);
		}
		else if (appState.in_lobby && appState.is_host) {
			setControlsDisabled(false);
		}
		else if (appState.in_lobby && !appState.is_host) {
			setControlsDisabled(true);
		}
		else if (!appState.in_lobby) {
			setControlsDisabled(false);
		}
	}, [appState, musicState]);

	// Music State Handler
	useEffect(() => {
		if (!audioRef.current) {
			console.log("AudioRef is missing");
			return;
		}

		if (!musicState.has_item) {
			audioRef.current.src = "";
			audioRef.current.currentTime = 0;
		}

		const musicStateManager = async () => {
			if (musicState.state === MPState.PLAY) {
				await audioRef.current.play();
			}
			else if (musicState.state === MPState.PAUSE) {
				await audioRef.current.pause();
			}
			else if (musicState.state === MPState.CHANGE_MUSIC) {
				try {
					audioRef.current.src = await fetchMusicUrl(musicState.id);
					audioRef.current.volume = musicState.volume / 100;
					audioRef.current.currentTime = 0;
					updateMusicState({ timestamp: 0 });
				} catch(err) {
					console.error("Failed to play music:", err);
				} finally {
					updateMusicState({ state: MPState.PLAY });
				}
			}
			else if (musicState.state === MPState.CHANGE_TIME) {
				audioRef.current.currentTime = musicState.state_data;
				if (audioRef.current.paused) {
					updateMusicState({ state: MPState.PAUSE, state_data: 0 });
				} else {
					updateMusicState({ state: MPState.PLAY, state_data: 0 });
				}
			}
			else if (musicState.state === MPState.CHANGE_VOLUME) {
				audioRef.current.volume = musicState.state_data / 100;
				if (audioRef.current.paused) {
					updateMusicState({ state: MPState.PAUSE, state_data: 0 });
				} else {
					updateMusicState({ state: MPState.PLAY, state_data: 0 });
				}
			}
		}

		musicStateManager();
	}, [musicState]);

	// Event listeners for audio element
	useEffect(() => {
		const audioElement = audioRef.current;
		if (!audioElement) return;
		audioElement.addEventListener("timeupdate", () => {
			updateMusicState({ timestamp: audioElement.currentTime });
		});
		audioElement.addEventListener("loadedmetadata", () => {
			updateMusicState({ duration: audioElement.duration });
		});
		audioElement.addEventListener("volumechange", () => {
			updateMusicState({ volume: audioElement.volume * 100 });
		});
	}, [audioRef.current]);

	const handleOnEnded = () => {
		updateMusicState({ state: MPState.PAUSE });
	};

	return ReactDOM.createPortal(
		<audio ref={audioRef} onEnded={handleOnEnded} />,
		document.body,
	);
};

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<AppStateProvider>
			<AudioElement />
			<Router>
				<App />
			</Router>
		</AppStateProvider>
	</StrictMode>,
);
