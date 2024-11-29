import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter as Router } from "react-router-dom"
import App from './App.jsx'
import Signup from './routes/signup/Signup.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		{/* <Router>
			<App/>
		</Router> */}
		<Signup/>
	</StrictMode>
)
