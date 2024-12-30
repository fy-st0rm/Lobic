import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './routes/login/Login.jsx';
import Home from "./routes/home/Home.jsx";
import Auth from "./routes/auth/Auth.jsx";
import Signup from './routes/signup/Signup.jsx';
import ForgotPassword from './routes/login/ForgotPassword.jsx';
import Lobby from "./routes/lobby/Lobby.jsx";

function App() {
	return (
		<Routes>
			<Route path="/signup" element={<Signup />} />
			<Route
				path="/home"
				element={
					
						<Home />
				
				}
			/>
			<Route
				path="/lobby"
				element={
					
						<Lobby key={location.pathname} />
				
				}
			/>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<Login />} />
			<Route path="/forgotpassword" element={<ForgotPassword />} />
		</Routes>
	);
}

export default App;
