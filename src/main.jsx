import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom"
import ReactDOM from "react-dom";

import App from './App.jsx'
import { AppStateProvider, useAppState } from "./AppState.jsx";
import { MPState, fetchMusicUrl } from "./const.jsx";

import './index.css'

// Global audio element
const AudioElement = () => {
	const { audioRef, musicState, updateMusicState } = useAppState();

	useEffect(() => {
		// Initializing the audio if the music exists in state
		const init_audio = async () => {
			if (!musicState.has_item) return;
			updateMusicState(MPState.PAUSE);

			if (!audioRef.current) return;
			audioRef.current.src = await fetchMusicUrl(musicState.id);
			await audioRef.current.pause();
		}
		init_audio();
	}, [])

	const handleOnEnded = () => {
		updateMusicState(MPState.PAUSE);
	}

	return ReactDOM.createPortal(
		<audio
			ref={audioRef}
			onEnded={handleOnEnded}
		/>,
		document.body
	);
};

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AppStateProvider>
			<AudioElement/>
			<Router>
				<App/>
			</Router>
		</AppStateProvider>
	</StrictMode>
)
