import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom"
import ReactDOM from "react-dom";

import App from './App.jsx'
import { AppStateProvider, useAppState } from "./AppState.jsx";

import './index.css'

// Global audio element
const AudioElement = () => {
	const { audioRef } = useAppState();
	return ReactDOM.createPortal(
		<audio ref={audioRef}/>,
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
