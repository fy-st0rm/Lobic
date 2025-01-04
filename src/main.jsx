import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom"

import App from './App.jsx'
import { AppStateProvider } from "./AppState.jsx";

import './index.css'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AppStateProvider>
			<Router>
				<App/>
			</Router>
		</AppStateProvider>
	</StrictMode>
)
