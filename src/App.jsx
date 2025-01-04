import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './routes/login/Login.jsx';
import Home from "./routes/home/Home.jsx";
import Auth from "./routes/auth/Auth.jsx";
import Signup from './routes/signup/Signup.jsx';
import ForgotPassword from './routes/login/ForgotPassword.jsx';
import Lobby from "./routes/lobby/Lobby.jsx";
import Chats from "./routes/chats/Chats.jsx";
import Playlist from './routes/playlist/Playlist.jsx';


function App() {
	return (
		<Routes>
			{/* <Route path="/" element={<Navigate to="/chats" replace />} />
			<Route path="/chats" element={<Chats />} /> */}
			<Route path="/signup" element={<Signup />} />
			<Route
				path="/home"
				element={
					<Auth>
						<Home/>
					</Auth>
				}
			/>
			<Route
				path="/lobby"
				element={
					<Auth>
						<Lobby key={location.pathname} />
					</Auth>
				}
			/>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<Login />} />
			<Route path="/forgotpassword" element={<ForgotPassword />} />
			<Route path="/chats" element={<Chats />} />
			<Route path="/playlist" element={<Playlist />} />

		</Routes>
	);
}

export default App;
