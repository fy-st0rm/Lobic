import { useEffect } from "react"
import {
	Routes, Route, Link,
	useNavigate
} from 'react-router-dom'

import Login from './routes/login/Login.jsx'
import Home from "./routes/home/Home.jsx"
import Auth from "./routes/auth/Auth.jsx"

function App() {
	const navigate = useNavigate();

	return (
		<Routes>
			<Route path = "/" element = { <Login/> } />
			<Route path = "/home" element = {
				<Auth>
					<Home/>
				</Auth>
			} />
		</Routes>
	);
}

export default App