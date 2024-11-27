import {
	Routes, Route, Link,
	useNavigate
} from 'react-router-dom'
import Login from './routes/login/Login.jsx'
import { useEffect } from "react"

function App() {
	const navigate = useNavigate();

	useEffect(() => {
		navigate("/login");
	}, []);

	return (
		<Routes>
			<Route path = "/login" element = { <Login/> } />
		</Routes>
	);
}

export default App
